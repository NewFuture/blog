---
layout: post
title: Elife Ert 631 开启telnet 和刷机
private: true
# feature-img: 
---

## 开启telnet

### 备份

`系统管理 > 备份恢复 > 新建备份`
下载 备份文件

### 修改备份文件

可使用7z浏览直接编辑

1. 修改 `/etc/rc.local` 开启telnet
```diff
# Put your custom commands here that should be executed once
# the system init finished. By default this file does nothing.

echo 3 > /proc/sys/vm/drop_caches
+ telnetd -l /bin/ash &
exit 0
```

### 恢复备份

备份界面选择恢复，使用修改后的配置文件

### telnet

```
telnet 192.168.2.1 # 或者修改后的IP
```


## 备份分区 (可选)

```sh
cat /proc/mtd

dd if=/dev/mtd0 | tftp -p -l - 192.168.1.2 -r ert631_full_flash.bin
# 分区备份
dd if=/dev/mtd1 | tftp -p -l - 192.168.1.2 -r ert631_mtd1_BL2_backup.bin
dd if=/dev/mtd2 | tftp -p -l - 192.168.1.2 -r ert631_mtd2_u-boot-env_backup.bin
dd if=/dev/mtd3 | tftp -p -l - 192.168.1.2 -r ert631_mtd3_Factory_backup.bin
dd if=/dev/mtd4 | tftp -p -l - 192.168.1.2 -r ert631_mtd4_FIP_backup.bin
dd if=/dev/mtd5 | tftp -p -l - 192.168.1.2 -r ert631_mtd5_ubi_backup.bin
```

## 输入 uboot

### 下载uboot

本地或者网络
```
cd tmp

tftp -g 192.168.1.2 -r mt7981_komi_a31-fip-fixed-parts.bin
或者
wget https://od.lk/d/NTVfMzUwMTU1ODZf/mt7981_konka_komi-a31-fip-fixed-parts.bin
或者

```

### 写入 FIP
```
mtd write mt7981_konka_komi-a31-fip-fixed-parts.bin FIP
```


### Uboot
重启按住 reset键进入uboot界面

1. 修改有线 ip `192.168.2.x`
2. 输入 `192.168.2.1`

