---
layout: post
title: 修改集客固件设备树(DTB)
subtitle: Modify the device tree of Gecoos firmware
private: true
# feature-img: 
---

## 背景

路由器刷入集客固件之后，led红灯，无法正常控制。

以康佳Komi-A31为例，使用798xuboot可以看到uboot灯是正常的,uboot源码中led灯的定义。
```dts
leds {
		compatible = "gpio-leds";

		led@0 {
			label = "green:system";
			gpios = <&gpio 8 GPIO_ACTIVE_LOW>;
		};

		led@1 {
			label = "blue:system";
			gpios = <&gpio 13 GPIO_ACTIVE_LOW>;
		};

		led@2 {
			label = "red:system";
			gpios = <&gpio 34 GPIO_ACTIVE_LOW>;
		};
	};
```

## 修改尝试 uboot (失败)
解包老版本AP250md代码发现，固件代码中调用了 ap250md:green,ap250md:red等6个led设备

```sh
ucidef_set_led_default "green" "GREEN" "ap250md:green" "1"
ucidef_set_led_default "green2" "GREEN2" "ap250md:green2" "1"
ucidef_set_led_default "green3" "GREEN3" "ap250md:green3" "1"
ucidef_set_led_default "red" "RED" "ap250md:red" "0"
ucidef_set_led_default "red2" "RED2" "ap250md:red2" "0"
ucidef_set_led_default "red3" "RED3" "ap250md:red3" "0"
```

尝试修改uboot的led定义来匹配这些label，结果无效。

## kernel 中的设备树

解包kernel发现已经内置了设备树，搜索代码可以找到`fdt-1`.

于是只能尝试修改固件中的内置设备树，固件其实就是一个升级文件包含
* kernel (编译后的文件，无法完全解包)
* root (魔改版的squashfs4.0,暂时无法解包)

### 分析固件中的设备树

虽然固件无法完全解包，当时通过设备树提取工具,试过好几个都差不多，
最后用这个Windows下的比较方便 https://github.com/roma21515/DTB-CONVERTER
解包之后自动反编译DTS文件发现led的定义与komi-a31的完全对不上

```
leds {
    	compatible = "gpio-leds";
        green {
			label = "ap250md:green";
			gpios = <0x0c 0x04 0x01>;
		};
    	green2 {
			label = "ap250md:green2";
			gpios = <0x0c 0x09 0x01>;
		};
		green3 {
			label = "ap250md:green3";
			gpios = <0x0c 0x07 0x01>;
		};
		red {
			label = "ap250md:red";
			gpios = <0x0c 0x05 0x01>;
		};
		red2 {
			label = "ap250md:red2";
			gpios = <0x0c 0x0a 0x01>;
		};
		red3 {
			label = "ap250md:red3";
			gpios = <0x0c 0x03 0x01>;
		};
	};
```

### 尝试打包写回

修改代码引脚绿色(0x8)红色(0x22)重新打包kernel，
再打包固件通过uboot重新写入烧录。

重启和发现系统无法正常启动。

## hash校验

通过拆机焊接ttl，查看正常的串口console的启动日志发现

```
Read 2793472 bytes from volume kernel to 0000000046000000
## Loading kernel from FIT Image at 46000000 ...
   Using 'config-1' configuration
   Trying 'kernel-1' kernel subimage
     Description:  AP250MD(8.0_2024120200) Linux-5.4.246
     Type:         Kernel Image
     Compression:  lzma compressed
     Data Start:   0x460000e4
     Data Size:    2707234 Bytes = 2.6 MiB
     Architecture: AArch64
     OS:           Linux
     Load Address: 0x48080000
     Entry Point:  0x48080000
     Hash algo:    crc32
     Hash value:   ab791321
     Hash algo:    sha1
     Hash value:   6535f4a84e313b1315d171cc289329e0def9e500
   Verifying Hash Integrity ... crc32+ sha1+ OK
## Loading fdt from FIT Image at 46000000 ...
   Using 'config-1' configuration
   Trying 'fdt-1' fdt subimage
     Description:  ARM64 WLAN ap250md device tree blob
     Type:         Flat Device Tree
     Compression:  uncompressed
     Data Start:   0x4629513c
     Data Size:    17961 Bytes = 17.5 KiB
     Architecture: AArch64
     Hash algo:    crc32
     Hash value:   0b05b284
     Hash algo:    sha1
     Hash value:   63b45d3d2ba25db1b6b266f9f8cbe580798ed682
   Verifying Hash Integrity ... crc32+ sha1+ OK
   Booting using the fdt blob at 0x4629513c
Working FDT set to 4629513c
   Uncompressing Kernel Image
   Loading Device Tree to 000000004f7f3000, end 000000004f7fa628 ... OK
Working FDT set to 4f7f3000

Starting kernel ...
```

在kernel启动之前会先校验kernel的hash和设备树的hash值再启动

### 手动修改固件

替换led引脚
```diff
-0000000c0000000400000001
+0000000c0000000800000001

-0000000c0000000500000001
+0000000c0000002200000001
```

### 计算hash

经过查询大量相关资料发现，在固件中搜索设备树的标记头几下此处的位置`D00DFEED` (后面四位是文件大小)
![](/assets/img/modify-the-device-tree-of-gecoos-firmware/fdtb-header.png)

```sh
# 切割fdt-1
dd if=fix-led.bin of=fdt bs=1 skip=2709820 count=17961
# 计算CRC32
crc32 fdt
# 计算hash1
sha1sum fdt
```

将计算完的数据替换

```diff
-0b05b284
+1a25c240
00000003000000060000004463726333

-63b45d3d2ba25db1b6b266f9f8cbe580798ed682
+78bad13a04a231ec572a11f4b20c317f2562242c
00000003000000050000004473686131
```

uboot重新写入此固件即可点亮绿灯和开关led.

注意：本身的升级固件还有footprint 签名校验，文件修改导致校验不通过，不能直接升级。



## 彩蛋

### 自动打包工具

* 修复工具(脚本) <https://github.com/NewFuture/jike-led>
* 自动更新固件 <https://jike-led.newfuture.cc/>

### 挂载 rootfs_data 分区
```
mkdir /mnt/ubi4_data
mount -t ubifs /dev/ubi0_4 /mnt/ubi4_data
```
