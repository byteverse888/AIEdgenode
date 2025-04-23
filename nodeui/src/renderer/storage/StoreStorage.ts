import BaseStorage from './BaseStorage'
import { defaultSessionsForEN, defaultSessionsForCN } from '../packages/initial_data'
import platform from '@/platform'
import { debounce } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

export enum StorageKey {
  ChatSessions = 'chat-sessions',
  Configs = 'configs',
  Settings = 'settings',
  MyCopilots = 'myCopilots',
  ConfigVersion = 'configVersion',
  RemoteConfig = 'remoteConfig',
  ChatSessionsList = 'chat-sessions-list',
}

export const StorageKeyGenerator = {
  picture(category: string) {
    return `picture:${category}:${uuidv4()}`
  },
  file(sessionId: string, msgId: string) {
    return `file:${sessionId}:${msgId}:${uuidv4()}`
  },
}

export default class StoreStorage extends BaseStorage {
  constructor() {
    super()
  }
  public async getItem<T>(key: string, initialValue: T): Promise<T> {
    let value: T = await super.getItem(key, initialValue)

    if (key === StorageKey.ChatSessions && value === initialValue) {
      const lang = await platform.getLocale().catch((e) => 'en')
      if (lang.startsWith('zh')) {
        value = defaultSessionsForCN as T
      } else {
        value = defaultSessionsForEN as T
      }
      await super.setItemNow(key, value)
    }
    if (key === StorageKey.Configs && value === initialValue) {
      await super.setItemNow(key, initialValue) // 持久化初始生成的 uuid
    }

    return value
  }

  // 对 setItem 进行防抖，应对消息生成时频繁写入时导致的性能问题
  // 实际用户反馈中发现，频繁写入时，会导致内存占用过高甚至卡顿，尤其是一些安全软件会自动扫描新创建的 JSON 文件
  private setItemWithDebounce = debounce(
    (key: string, value: any) => {
      return super.setItemNow(key, value)
    },
    500, // 这里设置太大会可能导致用户关闭应用时没有及时保存数据，根据消息生成的最大速度 100ms 设计
    { maxWait: 60 * 1000 }
  )

  /**
   * 异步写入（防抖）
   * @deprecated 此方法仅用于兼容 jotail 的 atomWithStorage 的写入，不建议直接使用
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    return this.setItemWithDebounce(key, value)
  }
}
