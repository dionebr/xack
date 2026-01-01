UPDATE public.roadmap_topics
SET content = '
# Operating Systems Architecture

> **"To hack the system, you must understand the system."**

An **Operating System (OS)** is not just software; it is the government of the computer. It decides who gets resources, who lives (processes), and who dies (kill signal). For a Cyber Operator, the OS is the terrain where the battle is fought.

---

## The Big Picture

Imagine the computer as a fortress.

*   **Hardware (CPU/RAM)**: The Treasure. Authentic power.
*   **Kernel**: The King. Controls access to the treasure.
*   **User Space**: The Village. Where normal citizens (applications) live.

```mermaid
graph TD
    A[User Space Ring 3] -->|Syscall| B[Kernel Space Ring 0]
    B -->|Drivers| C[Hardware - CPU/RAM]
    style B fill:#333,stroke:#fff,stroke-width:2px,color:#fff
    style A fill:#111,stroke:#666,stroke-width:1px,color:#ddd
    style C fill:#111,stroke:#666,stroke-width:1px,color:#ddd
```

If a "villager" (e.g. Chrome.exe) wants to touch the "treasure" (draw on screen), they **must** ask the "King" (Kernel). They cannot do it themselves.

---

## 1. Kernel vs. User Space

The CPU enforces strict privilege levels called **Rings**.

### Kernel Space (Ring 0)
*   **Absolute Power**: Can execute any CPU instruction and access any memory address.
*   **The Danger Zone**: If code crashes here, the entire machine crashes (Blue Screen of Death / Kernel Panic).
*   **Resident**: Drivers, Process Scheduler, File System.

### User Space (Ring 3)
*   **Restricted**: Cannot access hardware directly.
*   **Sandbox**: If Chrome crashes here, only Chrome dies. The OS survives.

### The Bridge: System Calls (Syscalls)

When a program needs to do something "real" (read a file, send network packet), it uses a **Syscall**.

> **Hacker Tip**: Malware often "hooks" (intercepts) these syscalls to hide itself. If `ls` asks "what files are here?", a rootkit intercepts the answer and removes `malware.exe` from the list.

---

## 2. Processes & Threads

### The Process (The Container)
A process is a running instance of a program.
*   **Isolation**: Process A cannot read Process B''s memory. (Unless you exploit it).
*   **PID**: Every process has a unique ID.
    *   **PID 1**: The first process (`init` on Linux, `System` on Windows). The parent of all.

### The Thread (The Worker)
Threads live *inside* a process.
*   **Shared Memory**: Threads within the same process share the same variables/memory.
*   **Lightweight**: Cheaper to create than a full process.

---

## 3. Memory Management

The OS is a master illusionist. It lies to programs.

### Virtual Memory
Every program thinks it has access to a huge, continuous block of RAM starting at address `0x0000`.
In reality, the OS scatters their data across physical RAM chips and hard drives (Swap/Pagefile).

### Buffer Overflow (The Classic Exploit)

Imagine a glass (Buffer) that can hold 500ml of water.
If you pour 1 liter into it, the water spills onto the table.
In memory, "spilling" means rewriting the data *next* to the buffer.

```c
char buffer[10]; // Can hold 10 letters
strcpy(buffer, "ThisStringIsTooLongForTheBuffer"); 
// CRASH! We just overwrote the return address in memory.
```

*If a hacker controls what is written in that spill, they control the CPU.*

---

## Operator Challenge

**Objective**: Visualize the "invisible" processes running on your machine right now.

1.  **Open Terminal** (Linux/Mac) or **PowerShell** (Windows).
2.  **Execute** the command:

### Linux (The "xack" standard)

```bash
ps aux | grep root | head -n 5
```

*   `ps aux`: List all processes.
*   `|`: Pipe output to next command.
*   `grep root`: Filter only processes owned by the "King" (root).
*   `head`: Show only top 5.

### Windows

```powershell
tasklist /FI "USERNAME eq SYSTEM"
```

*   Lists processes owned by the `SYSTEM` account (Windows version of Root).

> **Reflect**: Why does the "System" need so many processes? Each one is a potential attack surface.
'
WHERE title = 'General Concepts (Kernel, Threads, Memory)';
