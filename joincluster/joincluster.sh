#!/bin/bash

# 定义颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 配置参数
CLOUD_IP="115.190.25.82:10000"
NODE_NAME="edge-node-$(hostname)"
if [ -z "$1" ]; then
    echo -e "${RED}错误: 必须提供TOKEN参数${NC}"
    echo "用法: ./$(basename "$0") <TOKEN>"
    exit 1
fi
TOKEN="$1"
CNI_PLUGIN="cni-plugins-linux-amd64-v1.6.0.tgz"

# 1. 安装基础依赖
install_dependencies() {
    echo -e "${GREEN}[1/6] 安装基础依赖...${NC}"
    sudo apt update
    sudo apt install -y socat conntrack ebtables ipset containerd
}

# 2. 配置containerd
configure_containerd() {
    echo -e "${GREEN}[2/6] 配置containerd...${NC}"
    
    # Todo:判断如果配置文件已经改过，就不做修改了

    # 生成默认配置
    sudo containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
    
    # 修改配置
    sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
    sudo sed -i 's|registry.k8s.io/pause:3.8|registry.aliyuncs.com/google_containers/pause:3.9|' /etc/containerd/config.toml
    
    # 添加镜像加速
    if ! grep -q 'docker.m.daocloud.io' /etc/containerd/config.toml; then
        sudo sed -i '/\[plugins\.\"io\.containerd\.grpc\.v1\.cri\".registry.mirrors\]/a\\n        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]\n          endpoint = ["https://docker.m.daocloud.io"]' /etc/containerd/config.toml
    fi
    sudo systemctl restart containerd
}

# 3. 安装CNI插件
install_cni() {
    echo -e "${GREEN}[3/6] 安装CNI插件...${NC}"
    
    # 检查CNI插件是否已存在
    if [ -f "/opt/cni/bin/bridge" ] && [ -f "/etc/cni/net.d/10-containerd-net.conflist" ]; then
        echo -e "${GREEN}检测到已存在CNI插件配置，跳过安装步骤${NC}"
        return 0
    fi

    if [ ! -f "$CNI_PLUGIN" ]; then
        echo -e "${RED}错误: CNI插件文件 $CNI_PLUGIN 不存在${NC}"
        exit 1
    fi

    sudo mkdir -p /opt/cni/bin
    sudo tar Cxzvf /opt/cni/bin "$CNI_PLUGIN"
    
    # 创建CNI配置
    sudo mkdir -p /etc/cni/net.d
    sudo tee /etc/cni/net.d/10-containerd-net.conflist > /dev/null <<EOF
{
  "cniVersion": "1.0.0",
  "name": "containerd-net",
  "plugins": [
    {
      "type": "bridge",
      "bridge": "cni0",
      "isGateway": true,
      "ipMasq": true,
      "promiscMode": true,
      "ipam": {
        "type": "host-local",
        "ranges": [
          [{"subnet": "10.224.0.0/16"}],
          [{"subnet": "2001:db8:4860::/64"}]
        ],
        "routes": [
          { "dst": "0.0.0.0/0" },
          { "dst": "::/0" }
        ]
      }
    },
    {
      "type": "portmap",
      "capabilities": {"portMappings": true}
    }
  ]
}
EOF
}

# 4. 安装KubeEdge
install_kubeedge() {
    echo -e "${GREEN}[4/6] 安装KubeEdge...${NC}"
    
    local kedge_archive="keadm-v1.20.0-linux-amd64.tar.gz"
    
    if [ ! -f "$kedge_archive" ]; then
        echo -e "${RED}错误: KubeEdge安装包 $kedge_archive 不存在${NC}"
        exit 1
    fi
    
    tar -xvf "$kedge_archive"
    sudo cp keadm-v1.20.0-linux-amd64/keadm/keadm /usr/bin/
}

# 5. 加入集群
join_cluster() {
    echo -e "${GREEN}[5/6] 加入KubeEdge集群...${NC}"
    
    # 确保共享挂载
    # sudo mount --make-rshared /
   
    # 如果目录存在，为了安全，提示手动删除目录/etc/kubeedge

    # 执行加入命令
    sudo keadm join \
        --cloudcore-ipport="$CLOUD_IP" \
        --token="$TOKEN" \
        --edgenode-name="$NODE_NAME" \
        --cgroupdriver=systemd 
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}错误: 加入集群失败${NC}"
        exit 1
    fi
}

# 6. 配置边缘节点
configure_edge() {
    echo -e "${GREEN}[6/6] 配置边缘节点...${NC}"
    
    # 修改edgecore配置
    EDGE_CORE_CONF="/etc/kubeedge/config/edgecore.yaml"
    if [ -f "$EDGE_CORE_CONF" ]; then
        sudo sed -i '/edgeStream/{n; s/enable: false/enable: true/}' "$EDGE_CORE_CONF"
	sudo sed -i '/metaServer/{n;n;n; s/enable: false/enable: true/}' "$EDGE_CORE_CONF"
        echo -e "${GREEN}已成功修改edgeStream配置${NC}"
    else
        echo -e "${RED}错误: 找不到配置文件 $EDGE_CORE_CONF${NC}"
        exit 1
    fi

    # 重启edgecore服务
    sudo systemctl restart edgecore.service
    
    echo -e "${GREEN}边缘节点 $NODE_NAME 已成功加入集群${NC}"
}

# 主执行流程
main() {
    # 参数校验
    if [ $# -lt 1 ]; then
        echo -e "${RED}错误: 必须提供TOKEN参数${NC}"
        echo "用法: ./$(basename "$0") <TOKEN>"
        exit 1
    fi
    all_args=("$@")
    TOKEN="${all_args[0]}"

    install_dependencies
    configure_containerd
    install_cni
    install_kubeedge
    join_cluster $TOKEN
    configure_edge
}

main "$@"
