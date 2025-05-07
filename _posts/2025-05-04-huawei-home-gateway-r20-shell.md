---
layout: post
title: 华为R20家用光猫shell提权
subtitle: hack Huawei R20 home gateway
private: true
# feature-img: 
---

仅适用R20家庭版光猫，利用内置openwrt系统提权

## 开启telnet

### 方法一：通过Web界面开启

1. 登录设备的Web管理界面。
   - 用户名：`telecomadmin`
   - 密码：`nE7jA%5m` 或者 `admintelecom`
2. 进入安全设置页面。
3. 找到Telnet选项并启用。

### 方法二：直接刷入配置

如果无超级管理员账号，
1. 普通管理员账号登录设备的Web管理界面。
2. 安全设置 关闭防火墙
3. 使用ONU使能工具升级或者开启

## 进入shell 提权

1. 开启CLI模式(可选)
   - telnet (root/adminHW)
   - su 模式 `set hardinfo value HW_SSMP_FEATURE_CLI_CHINA_MODE=1;FT_SYSTEM_COPY=0;FT_FIRMWARE_UPGRADE_PAGE=1;FT_PON_UPPORT_CONFIG=1;FT_UPPORT_DETECT=1;FT_DM_AUTOREBOOT_BYWEEK=1;`

2. saf-huawei
    1. `safe-huawei console`
    2. 密码 `upt` (无提示)
3. 编辑`/etc/rc.local`文件，确保系统启动时修改passwd。


```diff
# Put your custom commands here that should be executed once2 ^: |% D) n7 Z4 Y
# the system init finished. By default this file does nothing.
-
+sed -i '/^root/{s%/sbin/nologin%/bin/sh%;s%^root:[^:]*:%root::%}' /e8cvar/passwd
exit 0
``` 

4. 命令行执行 /bin/su，获取root权限。
```bash
/bin/su 
```
## 华为界面

1. 修改hw_boardinfo
   - 解密路径：`/mnt/jffs/hw_boardinfo`
   - 使用工具或脚本进行解密。
   - 修改字段加密保存

```
obj.id = "0x0000001a" ; obj.value = "COMMON";
obj.id = "0x0000001b" ; obj.value = "COMMON";
obj.id = "0x00000031" ; obj.value = "NOCHOOSE";
```

2. 修改 customize.txt 

```
COMMON COMMON
```

## Gpon/Epon 自适应

```
set upport mode 4 upportid 0x10200
```