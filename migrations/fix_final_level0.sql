-- FIX: Linux Fundamentals (Fix Mermaid Graph Syntax)
UPDATE public.roadmap_topics
SET content = '
# Linux Fundamentals

> **"Linux is the native language of the internet."**

90% of the world''s servers run Linux. If you want to break them (or fix them), you must live in the terminal.

---

## 1. The File System Hierarchy

Everything in Linux is a file. Unlike Windows with `C:\`, Linux starts at the Root `/`.

```mermaid
graph TD
    Root[/] --> Bin["bin : Binaries"]
    Root --> Etc["etc : Configs"]
    Root --> Home["home : Users"]
    Root --> Var["var : Logs/Data"]
    style Root fill:#f9f,stroke:#333
    style Bin fill:#333,stroke:#fff
    style Etc fill:#333,stroke:#fff
```

*   `/bin`: Binaries. Where your commands (`ls`, `cat`, `python`) live.
*   `/etc`: Configuration. If you want to change how a service works, you look here. (e.g., `/etc/passwd`).
*   `/var`: Variable data. Logs live here (`/var/log`). Logs are your enemy if you are attacking.
*   `/tmp`: User temporary files. Often a playground for exploits.

---

## 2. Permissions: The RWX Triad

Every file has 9 bits of permission. It determines who can read, write, or execute.

```visual-linux
// Triggers LinuxPermissionsVisual
```

**Rule of Thumb**: `777` allows anyone to touch your file. Only use it if you want to be hacked.

---

## 3. Essential Bash

The shell is your weapon.

```bash
# Search for "password" in all files
grep -r "password" /var/www/html

# Pipe output from one command to another
cat userlist.txt | sort | uniq

# Run as SuperUser (The King)
sudo apt update
```
'
WHERE title = 'Linux (Structure, Permissions, Bash)';

-- TOPIC: Fundamentals (LAN, WAN, VPN)
UPDATE public.roadmap_topics
SET content = '
# Network Fundamentals

> **"It''s not magic. It''s just packets."**

## What is a Network?
Two or more computers connecting to share resources.

```visual-network-topology
// Triggers NetworkTopologyVisual
```

### Types of Networks
1.  **LAN (Local Area Network)**: Your home or office network. Low latency, high speed.
    *   *Hackers love LANs: easier to sniff traffic, poison ARP, and move laterally.*
2.  **WAN (Wide Area Network)**: The Internet. Connects LANs together.
3.  **VPN (Virtual Private Network)**: An encrypted tunnel through a public network.
    *   *OpSec Rule #1: Always use a VPN when doing operations.*
'
WHERE title = 'Fundamentals (LAN, WAN, VPN)';

-- TOPIC: OSI & TCP/IP Models (New Content)
UPDATE public.roadmap_topics
SET content = '
# The OSI Model

To understand how data moves across the world, we use models. The most famous is the **OSI Model**.

---

## The 7 Layers of OSI

When you send a message, it goes DOWN the stack (encapsulation). When you receive, it goes UP (decapsulation).

```visual-osi
// Triggers OSIVisual
```

*   **L1 Physical**: Cables, WiFi, signals. "Is it plugged in?"
*   **L2 Data Link**: MAC Addresses. Switches. "Who is next to me?"
*   **L3 Network**: IP Addresses. Routing. "Where am I going?"
*   **L4 Transport**: TCP/UDP. Reliability. "Did it get there?"
*   **L7 Application**: HTTP, SSH. What the user sees.

> **TCP/IP Model**: A simpler version used in the real world (4 layers), but for learning, OSI is King.
'
WHERE title = 'OSI & TCP/IP Models';

-- TOPIC: Protocols (TCP, UDP, HTTP, DNS) (New Content)
UPDATE public.roadmap_topics
SET content = '
# Critical Protocols

The internet speaks many languages. Here are the most critical ones for an Operator.

---

## 1. DNS (Domain Name System)
The phonebook of the internet. Translates `google.com` to `142.250.190.46`.

```bash
# Query DNS manually
dig google.com
```

If you control DNS, you control where traffic goes. (Phishing, redirection).

---

## 2. HTTP vs HTTPS
*   **HTTP (Port 80)**: Cleartext. If I sniff the wire, I see your passwords.
*   **HTTPS (Port 443)**: Encrypted SSL/TLS. I see garbage.

```mermaid
graph LR
    User -->|HTTP Request| Server
    Server -->|HTTP Response| User
    style User fill:#333
    style Server fill:#333
```

---

## 3. TCP vs UDP
*   **TCP**: "Hello? Are you there? Okay, sending data. Did you get it?" (Reliable, slower).
*   **UDP**: "HERE IS DATA CATCH IT IF YOU CAN!" (Unreliable, fast. Used for streaming).
'
WHERE title = 'Protocols (TCP, UDP, HTTP, DNS)';

-- TOPIC: Addressing (IPv4/v6, Subnetting) (New Content)
UPDATE public.roadmap_topics
SET content = '
# IP Addressing & Subnetting

Every device needs an ID card.

```visual-addressing
// Triggers AddressingVisual
```

---

## IPv4 vs IPv6

### IPv4 (The Old Guard)
*   **Format**: `192.168.1.1` (4 numbers, 0-255).
*   **Problem**: We ran out of addresses.
*   **Private IPs**: `192.168.x.x` or `10.x.x.x` (Only work inside your LAN).

### IPv6 (The Future)
*   **Format**: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.
*   **Benefit**: Infinite addresses. No more NAT headaches.

---

## Subnetting (CIDR)

Subnetting divides a big network into smaller, secure chunks.

`192.168.1.0/24`
*   **The `/24`** means the first 3 numbers match.
*   **Range**: `192.168.1.1` to `192.168.1.254`.
*   **Broadcast**: `192.168.1.255` (Yells to everyone).

> **Hacker Tip**: Scanning a `/16` (65,536 hosts) takes way longer than a `/24` (254 hosts). Know your scope.
'
WHERE title = 'Addressing (IPv4/v6, Subnetting)';

-- TOPIC: Tools (Ping, Wireshark) (New Content)
UPDATE public.roadmap_topics
SET content = '
# Network Tools

An operator without tools is just a user.

---

## 1. Ping (ICMP)
The sonar of the internet. "Are you alive?"

```bash
ping 8.8.8.8
```

*   **TTL (Time To Live)**: Can reveal what OS the target is running (Linux=64, Windows=128).

---

## 2. Wireshark (The Sniffer)
Wireshark captures every packet flying through the air.

*   **Promiscuous Mode**: Listening to conversations not meant for you.
*   **Analysis**: Seeing exactly what data an app is sending home.

> **Warning**: Using Wireshark on a network you do not own is illegal in many jurisdictions. Use only in the Lab.
'
WHERE title = 'Tools (Ping, Wireshark)';
