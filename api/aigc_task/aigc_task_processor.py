# -*- coding: utf-8 -*-
import logging
from logging.handlers import RotatingFileHandler
import requests
import time
import json
from minio import Minio
import base64
import os
from urllib.parse import urljoin
from typing import Optional, List, Dict, Any

# 配置日志
logger = logging.getLogger('AITASK_LOGGER')
logger.setLevel(logging.INFO)
log_format = logging.Formatter(
    '%(asctime)s %(levelname)s %(name)s %(filename)s:%(lineno)d[%(funcName)s]: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

log_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(log_dir, exist_ok=True)
log_path = os.path.join(log_dir, 'aigc_task.log')
handler = RotatingFileHandler(log_path, maxBytes=10 * 1024 * 1024, backupCount=10, encoding='utf-8')
handler.setFormatter(log_format)
logger.addHandler(handler)


class AITaskConfig:
    """AI任务配置管理类"""

    def __init__(self):
        self.api_url = "http://8.130.135.47"
        self.task_url = urljoin(self.api_url, "/parseapi/parse/classes/AITask")
        self.task_num_once = 2
        self.parse_application_id = "BTGAPPId"
        self.parse_rest_api_key = "BTGAPIKEY"
        self.headers = {
            "X-Parse-Application-Id": self.parse_application_id,
            "X-Parse-REST-API-Key": self.parse_rest_api_key,
            "X-Parse-Revocable-Session": "1",
            "Content-Type": "application/json"
        }
        self.minio_url = "http://82.156.86.71:9000"
        self.sda_api = "http://127.0.0.1:7860"
        self.audio_stt_api = "http://127.0.0.1:8083/v1/audio/transcriptions"
        self.audio_tts_api = "http://127.0.0.1:8084/v1/audio/speech"


class FileManager:
    """文件管理类"""

    def __init__(self):
        self.tmp_dir = os.path.join(os.path.dirname(__file__), 'tmp')
        os.makedirs(self.tmp_dir, exist_ok=True)

    def get_tmp_path(self, file_name: str) -> str:
        """获取临时文件路径"""
        return os.path.join(self.tmp_dir, file_name)

    def clean_tmp_file(self, file_path: str) -> None:
        """清理临时文件"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.error(f"清理临时文件失败: {str(e)}")


class StorageManager:
    """存储管理类"""

    def __init__(self):
        self.minio_client = Minio(
            endpoint="82.156.86.71:9000",
            access_key="7yG6o8Fx5FODZayRkaN6",
            secret_key="NDBKpRdNcauBXweruwkOu4pbqItIcIkYmVlmbCBB",
            secure=False
        )
        self.bucket_name = "aitask"

    def upload_file(
            self,
            file_data: bytes,
            account_id: str,
            task_id: str,
            file_name: str
    ) -> str:
        """上传文件到MinIO并返回URL"""
        try:
            file_path = os.path.join("tmp", file_name)
            with open(file_path, 'wb') as f:
                f.write(file_data)

            object_path = f"{account_id}/{file_name}"
            self.minio_client.fput_object(
                self.bucket_name,
                object_path,
                file_path
            )

            # 生成URL
            file_url = urljoin(AITaskConfig().minio_url, f"{self.bucket_name}/{object_path}")
            return file_url
        except Exception as e:
            logger.error(f"文件上传失败: {str(e)}")
            raise
        finally:
            # 清理临时文件
            if os.path.exists(file_path):
                os.remove(file_path)


class TaskProcessor:
    """任务处理器类"""

    def __init__(self, task_type: str, account_id: str):
        self.task_type = task_type
        self.account_id = account_id
        self.config = AITaskConfig()
        self.file_manager = FileManager()
        self.storage_manager = StorageManager()

    def get_queue_tasks(self) -> List[Dict[str, Any]]:
        """获取待处理任务"""
        try:
            params = {
                "limit": self.config.task_num_once,
                "skip": 0,
                "where": json.dumps({
                    "type": self.task_type,
                    "status": 0
                })
            }
            logger.info(f"开始查询待处理{self.task_type}任务，查询参数: {params}")
            response = requests.get(
                self.config.task_url,
                params=params,
                headers=self.config.headers
            )
            response.raise_for_status()
            results = response.json().get('results', [])
            logger.info(f"成功获取{len(results)}个{self.task_type}任务")
            return results
        except Exception as e:
            logger.exception(f"获取任务失败，任务类型: {self.task_type}，错误信息: {str(e)}")
            return []

    def update_task_status(
            self,
            task: Dict[str, Any],
            status: int,
            result: Optional[List[str]] = None
    ) -> None:
        """更新任务状态"""
        logger.info(f"更新任务状态 任务ID: {task['objectId']} 新状态: {status}")
        try:
            update_url = f"{self.config.task_url}/{task['objectId']}"
            update_data = {
                "status": status,
                "result": result or [],
                "executor": self.account_id
            }
            response = requests.put(update_url, json=update_data, headers=self.config.headers)
            response.raise_for_status()
        except Exception as e:
            logger.error(f"任务状态更新失败: {str(e)}")

    def process_txt2img(self, task: Dict[str, Any]) -> List[str]:
        """处理文本转图像任务"""
        try:
            logger.info(f"开始处理txt2img任务，参数: prompt={task['data']['prompt']}")
            request_data = task['data']
            response = requests.post(
                f"{self.config.sda_api}/sdapi/v1/txt2img",
                json=request_data
            )
            response.raise_for_status()
            logger.info(f"txt2img处理成功，生成{len(response.json()['images'])}张图片")

            images = response.json()['images']
            file_urls = []
            for i, img_data in enumerate(images):
                image_bytes = base64.b64decode(img_data)
                file_name = f"output_{task['objectId']}_{i}.png"
                url = self.storage_manager.upload_file(
                    image_bytes,
                    self.account_id,
                    task['objectId'],
                    file_name
                )
                file_urls.append(url)

            return file_urls
        except Exception as e:
            logger.error(f"text2img处理失败: {str(e)}")
            raise

    def process_img2img(self, task: Dict[str, Any]) -> List[str]:
        """处理图像转图像任务"""
        try:
            logger.info(f"开始处理img2img任务，初始化图片尺寸: {len(task['data']['init_image'])}字节")
            request_data = task['data']
            response = requests.post(
                f"{self.config.sda_api}/sdapi/v1/img2img",
                json=request_data
            )
            response.raise_for_status()
            logger.info(f"img2img处理完成，输出图片尺寸: {len(response.json()['images'][0])}字节")
            return response.json()['images']
        except Exception as e:
            logger.error(f"img2img处理失败: {str(e)}")
            raise

    def process_txt2speech(self, task: Dict[str, Any]) -> List[str]:
        """处理文本转语音任务"""
        try:
            logger.info(f"开始文本转语音处理，文本长度: {len(task['data']['text'])}字符")
            request_data = task['data']
            response = requests.post(
                self.config.audio_tts_api,
                json=request_data
            )
            response.raise_for_status()
            audios = response.json()['audio']

            file_urls = []
            for i, audio_data in enumerate(audios):
                file_name = f"output_{task['objectId']}_{i}.wav"
                url = self.storage_manager.upload_file(
                    audio_data,
                    self.account_id,
                    task['objectId'],
                    file_name
                )
                file_urls.append(url)

            return file_urls
        except Exception as e:
            logger.error(f"text2audio处理失败: {str(e)}")
            raise

    def process_speech2txt(self, task: Dict[str, Any]) -> str:
        """处理语音转文本任务"""
        try:
            audio_file = task['data']['input']
            local_file_path = self.file_manager.get_tmp_path(f"{task['objectId']}_audio.wav")

            # 下载音频文件
            self.storage_manager.minio_client.fget_object(
                self.storage_manager.bucket_name,
                audio_file,
                local_file_path
            )

            # 发送音频文件到转文本API
            with open(local_file_path, 'rb') as audio_file:
                files = {'file': (os.path.basename(local_file_path), audio_file, 'audio/wav')}
                response = requests.post(
                    self.config.audio_stt_api,
                    files=files
                )
                response.raise_for_status()

            text_result = response.json()['text']
            result_file_name = f"{task['objectId']}_stt_result.txt"
            result_file_path = self.file_manager.get_tmp_path(result_file_name)

            with open(result_file_path, 'w', encoding='utf-8') as f:
                f.write(text_result)

            # 上传结果文件
            url = self.storage_manager.upload_file(
                open(result_file_path, 'rb').read(),
                self.account_id,
                task['objectId'],
                result_file_name
            )

            # 清理临时文件
            self.file_manager.clean_tmp_file(local_file_path)
            self.file_manager.clean_tmp_file(result_file_path)

            return url
        except Exception as e:
            logger.error(f"audio2txt处理失败: {str(e)}")
            raise

    def process_task(self, task: Dict[str, Any]) -> None:
        """处理单个任务"""
        try:
            logger.info(f"开始处理任务 {task['objectId']} task：{task}")

            if 'data' not in task:
                logger.error(f"任务 {task['objectId']} 缺少data字段，数据格式错误")
                return

            result_urls = []
            if self.task_type == "txt2img":
                result_urls = self.process_txt2img(task)
            elif self.task_type == "img2img":
                result_urls = self.process_img2img(task)
            elif self.task_type == "txt2speech":
                result_urls = self.process_txt2speech(task)
            elif self.task_type == "speech2txt":
                result_urls = [self.process_speech2txt(task)]

            # 更新任务状态
            self.update_task_status(task, 1, result_urls)
            logger.info(f"任务类型 {self.task_type} {task['objectId']} 处理完成")
        except Exception as e:
            logger.error(f"任务 {task['objectId']} 处理失败: {str(e)}")

    def run(self) -> None:
        """启动任务处理循环"""
        print(f"启动{self.task_type}任务处理循环，账户ID: {self.account_id}")
        logger.info(f"启动{self.task_type}任务处理循环，账户ID: {self.account_id}")
        while True:
            try:
                tasks = self.get_queue_tasks()
                logger.info(f"获取到{len(tasks)}个待处理{self.task_type}任务")
                if not tasks:
                    time.sleep(60)
                    continue

                for task in tasks:
                    self.process_task(task)

            except Exception as e:
                logger.error(f"主循环异常: {str(e)}")
                time.sleep(60)


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python task_processor.py [task_type] [account_id]")
        print("task_type: 可选类型: txt2img, img2img, txt2speech, speech2txt")
        print("account_id: 例如 account123")
        sys.exit(1)

    task_type = sys.argv[1]
    account_id = sys.argv[2]
    # task_type = "txt2img"
    # account_id = "account123"
    processor = TaskProcessor(task_type, account_id)
    processor.run()
