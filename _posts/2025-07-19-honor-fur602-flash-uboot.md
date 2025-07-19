---
layout: post
title: 荣耀 FUR-602 路由器 U-Boot 刷机指南
subtitle: Honor FUR-60x uboot
private: true
# feature-img: 
---

## 概述

本文档详细介绍如何为荣耀 FUR-602 路由器刷入 U-Boot 固件。该路由器使用联发科 MT7981 芯片组，支持通过 Web 控制台和 Telnet 进行固件操作。

## ⚠️ 重要警告

-   **刷机有风险，操作不当可能导致设备变砖**
-   **务必完整备份原始固件后再进行操作**
-   **确保网络连接稳定和电源供应可靠**
-   **请仔细阅读每个步骤，确保理解后再执行**

## 前置条件

### 硬件要求

-   荣耀 FUR-602 路由器
-   电脑（作为 TFTP 服务器）
-   网线连接设备

### 软件要求

-   TFTP 服务器软件
-   SSH/Telnet 客户端
-   网络配置工具

### 网络配置

不同型号可能不同

-   路由器 IP：`192.168.2.1`（默认）
-   电脑 IP：`192.168.2.2`（TFTP 服务器）
-   子网掩码：`255.255.255.0`

## 准备工作

### 第一步：设置 TFTP 服务器[可选]

1. 在电脑上安装并启动 TFTP 服务器
2. 配置电脑 IP 地址为：`192.168.2.2`
3. 设置 TFTP 根目录用于存放备份文件
4. 确保防火墙允许 TFTP 服务（端口 69）

### 第二步：下载 U-Boot 固件[可选]

从官方仓库下载适用于 FUR-602 的 U-Boot 固件：<https://github.com/hanwckf/bl-mt798x/releases>

需要下载的文件：`mt7981_honor_fur-602-fip-fixed-parts-multi-layout.bin`

## 刷机步骤

### 第一步：访问 Web 控制台

打开浏览器，访问以下地址之一：

-   Web console http://192.168.2.1/cgi-bin/luci/admin/mtk/console
-   Telnet 开关(可选) http://192.168.2.1/cgi-bin/luci/api/system/cus_telnet

### 第二步：查看分区信息【可选】

在控制台中执行：

```bash
cat /proc/mtd
```

这将显示设备的分区布局，确认各分区信息。

### 第三步：备份原始固件【可选】（重要！）

#### 3.1 备份完整 flash

```bash
dd if=/dev/mtd0 | tftp -p -l - 192.168.2.2 -r honor_fur602_full_flash.bin
```

#### 3.2 备份各个分区

```bash
# 备份BL2
dd if=/dev/mtd1 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd1_BL2.bin
dd if=/dev/mtd2 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd2_u-boot-env.bin
dd if=/dev/mtd3 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd3_Factory.bin
dd if=/dev/mtd4 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd4_Trace.bin
dd if=/dev/mtd5 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd5_FIP.bin
dd if=/dev/mtd6 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd6_ubi.bin
dd if=/dev/mtd7 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd7_Tracebak.bin
dd if=/dev/mtd8 | tftp -p -l - 192.168.2.2 -r honor_fur602_mtd8_foxfs.bin
```

-   mtd0: 完整 flash
-   mtd1: BL2 (第二阶段启动加载器)
-   mtd2: u-boot-env (U-Boot 环境变量)
-   mtd3: Factory (出厂设置)
-   mtd4: Trace (跟踪数据)
-   mtd5: FIP (固件镜像包)
-   mtd6: ubi (用户数据)
-   mtd7: Tracebak (跟踪备份)
-   mtd8: foxfs (文件系统)

**重要提示**：等待所有备份完成，确保 TFTP 服务器上已保存所有文件。

### 第四步：下载 U-Boot 固件到设备

```bash
tftp -g 192.168.2.2 -r mt7981_honor_fur-602-fip-fixed-parts-multi-layout.bin -l /dev/shm/fip.bin
```

> 当然也可也可以直接在控制台中使用 wget 命令下载

### 第五步：验证固件完整性

```bash
md5sum /dev/shm/fip.bin
```

确认 MD5 值为：`216265cd96b784aac523e37d524bdc92`

### 第六步：刷入 U-Boot 固件

```bash
mtd write /dev/shm/fip.bin FIP
```

### 第七步：重启设备

刷写完成后，重启路由器：

```bash
reboot
```

### 检查 U-Boot 启动

设备重启后，长按 reset 确认 U-Boot 正常加载。(注意 IP 地址可能会变更)

<!-- ### 温度监控

设备正常运行后，可以通过以下命令监控温度：

```bash
cat /sys/class/thermal/*/temp
```

-   正常待机温度：约 57.4℃
-   负载时温度：约 65℃

## 网络配置变更

刷入 U-Boot 后，设备的默认网络配置可能发生变化：

-   新的默认 IP 可能为：`192.168.1.1`
-   需要相应调整电脑网络配置以访问设备 -->

## 技术说明

### MT7981 芯片组

FUR-602 使用联发科 MT7981 芯片组，这是一个支持 Wi-Fi 6 的路由器 SoC.

## 参考资源

-   [bl-mt798x GitHub 项目](https://github.com/hanwckf/bl-mt798x)
-   [OpenWrt 官方文档](https://openwrt.org/)

---

**免责声明**：本文档仅供学习和研究使用。刷机操作存在风险，可能导致设备损坏或失去保修。请在充分理解风险的情况下进行操作，作者不对任何因使用本文档导致的损失承担责任。
