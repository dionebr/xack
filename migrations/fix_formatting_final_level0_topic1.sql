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
