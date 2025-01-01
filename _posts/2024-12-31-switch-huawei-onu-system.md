---
layout: post
title: 华为光猫主备系统切换(双系统)
subtitle: switch main system and standby system of Huawei ONU
private: true
# feature-img: 
---

## 前提

* 已经补全命令或者刷入Equipment插件

## 主备系统机制

华为光猫从V5开始，采用主备分区的方式同时保留两个系统分区。
升级的时候，会将新的系统写入备份分区，然后切换到备份分区启动，升级前的系统变成备份系统。

这样可以在升级后的系统出现故障或者无法启动(升级失败)，连续多次启动失败时，会尝试自动切换回之前的备份分区系统。

当新的系统稳定运行之后，会自带将新的系统写入备份分区，主备分区都变成了新系统。

### Web升级固件的方式切换系统(不推荐)

可以在升级页面上传要切换的系统固件，实现系统切换。
这个不需要补全shell也可以操作，是通常使用的方法。

但是如果从R22降级到R21一下的版本，会因为配置文件未解密，导致降级后，hw_boardinfo文件无法解析。
界面也会变成默认英文界面，而且此时命令行修改MAC和SN等无效。

### 命令行切换

在 SU_WAP 模式下执行 `system rollback`切换主备分区

```shell
WAP>su
SU_WAP>system rollback
```

这个时候，会自动处理需要加解密的问题。

这是一种更安全的切换方式，同时不需要原始的固件包，对于低版本升级而又没有原始固件很有用。

### 避免新系统自动覆盖旧系统

有一个功能开关`FT_SYSTEM_COPY`可以控制此功能，此开关默认打开

命令行关闭
```
WAP>su
SU_WAP>set hardinfo value FT_SYSTEM_COPY=0;
```
直接修改文件`/mnt/jffs2/hw_hardinfo_feature`
```
feature.name="FT_SYSTEM_COPY" feature.enable="0"
```

## 总结

* `FT_SYSTEM_COPY=0` 关闭系统自动同步
* `system rollback` 切换分区
