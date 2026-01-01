-- Populate/Update Content for Level 0 - Foundations (Master File)

-- Level 0 / Module: Operating Systems / Topic: General Concepts
UPDATE public.roadmap_topics
SET content = '
# Operating Systems Architecture

> **"To hack the system, you must understand the system."**

An **Operating System (OS)** is not just software; it is the government of the computer. It decides who gets resources, who lives (processes), and who dies (kill signal).

For a Cyber Operator, the OS is the terrain where the battle is fought.

---

## 1. Kernel vs. User Space

The CPU enforces strict privilege levels called **Rings**.

```visual-kernel
// This block triggers the React KernelVisual component
```

### Kernel Space (Ring 0)
*   **Absolute Power**: Can execute any CPU instruction and access any memory address.
*   **The Danger Zone**: If code crashes here, the entire machine crashes (Blue Screen of Death / Kernel Panic).

### User Space (Ring 3)
*   **Restricted**: Cannot access hardware directly.
*   **Sandbox**: If Chrome crashes here, only Chrome dies. The OS survives.

> **Syscall**: The bridge. If a "villager" (app) wants to touch the "treasure" (hardware), it must ask the King (Kernel).
> Hacker Tip: Rootkits live in Ring 0 to hide from Ring 3 tools like Task Manager.

---

## 2. Processes & Threads

### The Container vs The Worker

```visual-process
// This block triggers the React ProcessVisual component
```

**Process**: A heavy, isolated fortress. Has its own memory, PID, and rights. If it crashes, others are safe.

**Thread**: A lightweight worker inside the fortress. Many threads share the same memory. Fast to create, but if one messes up memory, the whole process might crash.

---

## 3. Memory Management

The OS is a master illusionist. It lies to programs via **Virtual Memory**. Every program thinks it has 100% of the RAM, but the OS maps it to physical blocks securely.

### Buffer Overflow (The Classic Exploit)

Imagine a glass (Buffer) that can hold 500ml of water. If you pour 1 liter, it spills. In memory, "spilling" means overwriting the Next Instruction pointer.

```c
char buffer[10]; 
strcpy(buffer, "ThisStringIsTooLongForTheBuffer"); 
// CRASH! We executed the spilled text as code.
```

---

## Operator Challenge

**Objective**: Visualize the "invisible" processes running on your machine right now.

1.  **Open Terminal** (or use the one below).
2.  **Execute** the command to see the King''s processes.

### Linux (The "xack" standard)

```bash
ps aux | grep root | head -n 5
```

### Windows

```powershell
tasklist /FI "USERNAME eq SYSTEM"
```

> **Reflect**: Why does the "System" need so many processes? Each one is a potential attack surface.
'
WHERE title = 'General Concepts (Kernel, Threads, Memory)';

-- Level 0 / Module: Operating Systems / Topic: Linux (Structure, Permissions, Bash)
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
    Root[/] --> Bin[bin<br>Binaries]
    Root --> Etc[etc<br>Configs]
    Root --> Home[home<br>Users]
    Root --> Var[var<br>Logs/Data]
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

> **Operator Tip**: Learning `grep`, `awk`, and `sed` makes you faster than any GUI tool.
'
WHERE title = 'Linux (Structure, Permissions, Bash)';

-- Level 0 / Module: Computer Networks / Topic: Fundamentals (LAN, WAN, VPN)
UPDATE public.roadmap_topics
SET content = '
# Network Fundamentals

> **"It''s not magic. It''s just packets."**

To understand how data moves across the world, we use models. The most famous is the **OSI Model**.

---

## The OSI Model (7 Layers)

When you send a message, it goes DOWN the stack (encapsulation). When you receive, it goes UP (decapsulation).

```visual-osi
// Triggers OSIVisual
```

*   **L1 Physical**: Cables, WiFi, signals. "Is it plugged in?"
*   **L3 Network**: IP Addresses. Routing. "Where am I going?"
*   **L4 Transport**: TCP/UDP. Reliability. "Did it get there?"
*   **L7 Application**: HTTP, SSH. What the user sees.

---

## Interfaces & Addressing

*   **MAC Address**: The physical ID of your card. Hardcoded. `00:1A:2B:...`
*   **IP Address**: The logical address. Changes depending on network. `192.168.1.10`

```mermaid
sequenceDiagram
    participant PC as Your Laptop
    participant Router
    participant Internet
    PC->>Router: Send Packet (Src: 192.168.1.5)
    Router->>Internet: NAT (Src: 203.0.113.1)
    Note right of Router: Router rewrites the source IP!
```
'
WHERE title = 'Fundamentals (LAN, WAN, VPN)';

-- Level 0 / Module: Computer Networks / Topic: Networking II (Protocols)
UPDATE public.roadmap_topics
SET content = '
# Networking Protocols

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

> **Scanning Tip**: `nmap -sS` scans TCP SYN (stealthy). `nmap -sU` scans UDP (slow and painful).
'
WHERE title = 'IP, TCP/UDP, Ports, OSI';

-- Level 0 / Module: Virtualization / Topic: Virtualization
UPDATE public.roadmap_topics
SET content = '
# Virtualization & Containers

Modern infrastructure is virtual. Servers are rarely physical boxes anymore.

---

## Virtual Machines (VM) vs Containers

```visual-virtualization
// Triggers VirtualizationVisual
```

### Virtual Machines
*   Emulate an entire hardware PC.
*   Heavy (GBs in size).
*   Secure isolation (Harder to break out of).

### Containers (Docker)
*   Share the host kernel.
*   Lightweight (MBs in size).
*   Fast startup (Milliseconds).
*   **Danger**: Kernel exploits can escape the container to the host!

---

## Operator Command: Docker
Running a quick hacking lab:

```bash
# Launch a Kali Linux container instantly
docker run -it kali-rolling /bin/bash
```

This gives you a disposable attack machine in seconds.
'
WHERE title = 'Virtualization (VMs, Containers, Docker)';
