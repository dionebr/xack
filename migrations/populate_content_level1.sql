
-- Level 1 / Programação / Logic
UPDATE public.roadmap_topics
SET content = '
# Programming Logic

Coding is the superpower of the 21st century. For hackers, it is mandatory.

## Variables & Data Types
Think of variables as boxes.
*   `Integer`: Whole numbers (1, 42).
*   `String`: Text ("Hello").
*   `Boolean`: True/False.

## Flow Control
*   **If/Else**: Decision making. `if (password == "admin") allow_access()`
*   **Loops**: Automation. `for target in ip_list: scan(target)`

## Functions
Reusable blocks of code. Do not write the same code twice.
' WHERE title = 'Programming Logic';


-- Level 1 / Programação / Python
UPDATE public.roadmap_topics
SET content = '
# Python for Hackers

Python is the most popular language in security. It is readable, powerful, and has libraries for everything.

## Scapy
Manipulate network packets. Craft your own TCP headers.
```python
from scapy.all import *
packet = IP(dst="8.8.8.8")/ICMP()
send(packet)
```

## Requests
Interact with websites programmatically. Great for Brute Force or SQL Injection scripts.
```python
import requests
r = requests.get("http://target.com")
print(r.status_code)
```

## Sockets
Low-level networking. Connect to ports, send bytes. This is how you write a Reverse Shell.
' WHERE title = 'Python (Scripts, Sockets)';
