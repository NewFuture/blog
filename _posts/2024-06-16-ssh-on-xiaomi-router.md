---
layout: post
title: 小米路由器开启SSH (Telnet) 
subtitle: 以CR8809为例，需要2023年6月份之前的系统
private: true
# feature-img: 
---

## 背景

除了早期的小米路由器提供root功能外，新的系统都屏蔽了默认的远程访问。
目前常用的做法就是利用已经发现的漏洞注入shell开启telnet 或 ssh.

https://github.com/openwrt-xiaomi/xmir-patcher
Xmir patcher 为我们收集了重要的公开漏洞(维护期类的最新版都已经修复)，并利用这些漏洞注入脚本。

比如 CR8809等型号,使用的是一个比较通用的注入漏洞，smartcontroller API 参数注入(payload 需要转码)，实现执行任意命令。

## 准备环境

* python 3.8
* 稳定的网络环境可以访问python或者GitHub


## 示例

以下示例再 WSL 系统下进行先安装 python3 (sudo apt install pyhton3)
然后clone https://github.com/openwrt-xiaomi/xmir-patcher 

#### 1. 启动程序 `./run.sh`

首次会安装大量的python依赖比较慢，国内可能需要切换python源
```sh
./run.sh
... some info about packages
==========================================================

Xiaomi MiR Patcher  

 1 - Set IP-address (current value: 192.168.2.1)
 2 - Connect to device (install exploit)
 3 - Read full device info
 4 - Create full backup
 5 - Install EN/RU languages
 6 - Install Breed bootloader
 7 - Install firmware (from directory "firmware")
 8 - {{{ Other functions }}}
 9 - [[ Reboot device ]]
 0 - Exit

Select:
```
确认小米路由器IP 是 192.168.2.1 (可以打开网页登录界面). 如果不是就看改成正确的或者重置。

#### 2. 然后选择 `2` 开启ssh

列出路由器设备信息
```sh
Select: 2

device_name = CR8809
rom_version = 6.2.182 release
mac address = 74:3a:f4:01:30:ec
CountryCode = CN
```

#### 3. 输入管理密码等待开启

慢慢等待需要2分钟左右
```sh
Enter device WEB password: GuanLiMiMa
Enable smartcontroller scene executor ... # 检测 smartcontroller API
Wait smartcontroller activation ... # 确认 smartcontroller 漏洞是否可用
Unlock dropbear service ... # 解锁 dropbear (删除release标记)
Unlock SSH server ... # 修改 ssh 配置 (ssh_en=1)
Set password "root" for root user ... # 修改root 密码为 root
Enabling dropbear service ... # 启动 dropbear （ssh 服务）
Run SSH server on port 22 ... # 重启 ssh
Test SSH connection to port 22 ... # 测试

#### SSH server are activated! ####
```

#### 4. 重启测速

重连WiFI
```sh
ssh root@192.168.2.1
# 密码root
```
