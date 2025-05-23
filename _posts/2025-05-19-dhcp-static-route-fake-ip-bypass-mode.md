---
layout: post
title: Fake IP 静态旁路由分流 
subtitle: DHCP + Static Route + Fake IP
private: true
# feature-img: 
---

## 基本原理

* 设备（手机PC等）
   * 使用旁路由（代理主机）进行 DNS 解析
   * 所有流量直接到网关(主路由)
* 旁路由（代理主机）
   * 作为内网透明代理服务器
   * 同时提供DNS解析服务(代理的一部分功能)
      * 对于需要代理的域名，返回fakeIP
      * 对于需要屏蔽的域名(广告)，直接拒绝
      * 其它域名(直连域名)，返回真实IP
* 网关(主路由): 整个网络真正的出口，负责NAT，内外网转发等
   * DHCP 分配IP
      * 为旁路由（代理主机）配置固定静态IP
   * 管理整个网络的路由和分流
      * 内网和外网转发
      * FakeIP 的数据转发到旁路由（代理主机）

## 优缺点

### 优点

* 直连网关: 直连流量，直接走硬路由转发，不经过旁路由(代理主机)
* 主备DNS: 即使旁路由（代理主机）离线，会自动切换备份DNS，整个网络依然正常使用
* 设备免配: 可以同在网关上配置，实现客户端自动处理无需配置

### 缺点

* 网关需可配置静态路由
* 无法代理IP (可以通过手动配置静态路由解决)


## 例子

* 网关地址 192.168.1.1
* 旁路由(代理主机) 192.168.1.2


### 网关(主路由)

这里以华为光猫为例，只要支持配静态路由的设备即可。

#### DHCP 配置

![DHCP](/assets/img/dhcp-static-route-fake-ip-bypass-mode/dhcp-config.png)

关键配置

* 主DNS: 指向旁路由IP地址 192.168.1.2
* 备用DNS: 主路由挂时使用,可以是192.168.1.1或者其他公共DNS

手机等设备联网后，在分配IP时，同时会自动指定DNS

#### 静态路由

![Stati Route](/assets/img/dhcp-static-route-fake-ip-bypass-mode/static-route.png)

关键配置

* 使用的FakeIP地址池是198.18.0.0/15，对应子网掩码255.254.0.0
* WAN 是内网直接选br0

这样就会把 FakeIP 地址池的流量路由到 192.168.1.2。如果其他IP直连的希望走代理，也可以添加到这里。


### 旁路由（代理主机）

这里使用singbox为例，其他支持FakeIP和透明代理的工具均可。
只显示DNS相关配置，其它代理配置规则正常配置即可。

#### DNS 解析配置

```json
{
   "dns":{
      "server":[
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
        "rule_set": "srs-ads"
        "action": "reject"
       },
      {
        "query_type": ["A"],
        "rule_set": "srs-proxy",
        "server": "dns_fake"
      },
      {
        "query_type": ["AAAA", "HTTPS", "SVCB"],
        "rule_set": "srs-proxy"
        "action": "predefined"
      }
    ],
    "final": "dns_default",
    "independent_cache": true
   }
}
```
解释
1. FakeIp地址池只配置了IPv4(198.18.0.0/15)主要方便配置，其它流量和代理出站依然支持IPv6
2. srs-ads 广告域名规则，直接屏蔽DNS
3. srs-proxy 代理域名规则，A记录返回FakeIP，其他返回空
4. 其它常规DNS使用默认DNS(这里是阿里DNS)


#### 入站配置

```json

{
   "inbound":[
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

* dns-in 提供解析DNS
* tproxy-in 提供透明代理


#### 分流

* 广告域名 ==> × (屏蔽)
* 代理域名 ==168.18.x.x==> 网关(**LAN**) ==> 主机(192.168.1.2) ==> 网关(**WAN**) ==> 代理服务器 ==> 真实IP
* 其它域名 ==真实IP==> 网关(**WAN**) ==> 互联网(真实IP)