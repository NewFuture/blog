---
layout: post
title: Fake IP 静态旁路由分流 
subtitle: DHCP + Static Route + Fake IP
private: true
# feature-img: 
---

## 基本原理

![FakeIP bypass](/assets/img/dhcp-static-route-fake-ip-bypass-mode/fakeip-bypass-diagram.png)

* 设备（手机或 PC）
   * 使用旁路由（内网代理主机）进行 DNS 解析
   * 所有流量直接发送到网关（主路由）
* 旁路由（内网代理主机）
   * 作为内网透明代理服务器
   * 同时提供 DNS 解析服务（代理的一部分功能）
      * 对需要代理的域名，返回 FakeIP
      * 对需要屏蔽的域名（广告），直接拒绝
      * 其它域名（直连域名），返回真实 IP
* 网关（主路由）：整个网络的实际出口，负责 NAT、内外网转发等
   * DHCP 分配 IP
      * 为旁路由（代理主机）配置固定静态 IP
   * 管理整个网络的路由和分流
      * 内网和外网转发
      * 将 FakeIP 的数据转发到旁路由（代理主机）

## 优缺点

### 优点

* 直连网关：直连流量直接通过硬路由转发，不经过旁路由（代理主机）
* 主备 DNS：即使旁路由（代理主机）离线，会自动切换到备用 DNS，整个网络依然可正常使用
* IPv6 直连和代理均可正常使用
* 设备免配置：可直接在网关上配置，实现客户端自动处理，无需手动配置

### 缺点

* 网关需支持配置静态路由，部分设备可能不支持
* 只能代理域名，无法处理 IP（少量可通过手动配置静态路由解决）

## 实际例子

* 网关地址：192.168.1.1
* 旁路由（代理主机）：192.168.1.2

### 网关（主路由）

以华为光猫为例，只要支持配置静态路由的设备即可。

#### DHCP 配置

![DHCP](/assets/img/dhcp-static-route-fake-ip-bypass-mode/dhcp-config.png)

关键配置：

* 主 DNS：指向旁路由 IP 地址 192.168.1.2
* 备用 DNS：主DNS故障时使用，可以是 192.168.1.1 或其他公共 DNS

手机等设备联网后，在分配 IP 时会自动指定 DNS。
如果主路由不支持，也可手动配置设备路由。

#### 静态路由

![Static Route](/assets/img/dhcp-static-route-fake-ip-bypass-mode/static-route.png)

关键配置：

* 使用的 FakeIP 地址池为 198.18.0.0/15，对应子网掩码 255.254.0.0
* WAN 选择内网接口（如 br0）

这样就会把 FakeIP 地址池的流量路由到 192.168.1.2。如果希望其他 IP 流量也走代理，也可以添加到这里。

### 旁路由（代理主机）

只负责 DNS 和代理流量，对性能要求不高，实际可运行在 Android 盒子等设备中。

这里以 singbox 为例，其他支持 FakeIP 和透明代理的工具均可。
只展示 DNS 相关配置，其它代理配置规则正常配置即可。

#### DNS 解析配置

```json
{
   "dns": {
      "server": [
         {
            "type": "fakeip",
            "tag": "dns_fake",
            "inet4_range": "198.18.0.0/15"
         },
         {
            "type": "tls",
            "tag": "dns_default",
            "detour": "direct",
            "server": "223.6.6.6"
         }
      ],
      "rules": [
         {
            "rule_set": "srs-ads",
            "action": "reject"
         },
         {
            "query_type": ["A"],
            "rule_set": "srs-proxy",
            "server": "dns_fake"
         },
         {
            "query_type": ["AAAA", "HTTPS", "SVCB"],
            "rule_set": "srs-proxy",
            "action": "predefined"
         }
      ],
      "final": "dns_default",
      "independent_cache": true
   }
}
```
**解释：**
1. FakeIP 地址池只配置了 IPv4（198.18.0.0/15），主要方便配置，其它流量和代理出站依然支持 IPv6。
2. `srs-ads`：广告域名规则，直接屏蔽 DNS。
3. `srs-proxy`：代理域名规则，A 记录返回 FakeIP，其他类型返回空。
4. 其它常规 DNS 使用默认 DNS（这里是阿里 DNS）。

#### 入站配置

```json
{
   "inbound": [
      {
         "type": "direct",
         "tag": "dns-in",
         "listen": "::",
         "override_port": 53
      },
      {
         "type": "tproxy",
         "tag": "tproxy-in",
         "listen": "::",
         "listen_port": 9898,
         "sniff": true
      }
   ]
}
```

* `dns-in`：提供 DNS 解析
* `tproxy-in`：提供透明代理

### 流量处理过程

* **直连请求处理过程**
   1. DNS 获取真实 IP（IPv4 或 IPv6）
   2. 请求发送到网关（192.168.1.1）
   3. 网关通过 **WAN** 转发到互联网

* **需要代理的请求处理过程**
   1. DNS 返回 FakeIP（198.18.x.x）
   2. 请求发送到网关（192.168.1.1）
   3. 网关根据静态路由，通过 **LAN** 转发到内网代理主机（192.168.1.2）
   4. 代理主机根据 FakeIP 地址映射，查找域名和代理信息，请求代理服务器
   5. 请求再经网关（192.168.1.1），通过 **WAN** 转发到互联网
   6. 到达代理服务器，代理服务器解析域名并请求对应服务
