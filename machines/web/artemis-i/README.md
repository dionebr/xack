# ARTEMIS I - Corporate Monitoring System

![Difficulty: Intermediate](https://img.shields.io/badge/Difficulty-Intermediate-orange)
![Points: 1000](https://img.shields.io/badge/Points-1000-blue)
![Category: Web](https://img.shields.io/badge/Category-Web-orange)
![Flags: 4](https://img.shields.io/badge/Flags-4-green)

## 📋 Description

ARTEMIS I is a corporate monitoring system developed by UHC Labs. The system features a public monitoring interface and several internal services protected by firewall. Your mission is to capture all 4 flags by exploiting vulnerabilities and escalating privileges through multiple stages.

## 🎯 Objectives

- **Flag 1 - Public** (100 points): Find the public API key
- **Flag 2 - User** (200 points): Extract user-level secrets from the database
- **Flag 3 - Admin** (300 points): Access the internal admin panel
- **Flag 4 - Root** (400 points): Achieve root access and read the final flag

## 🏗️ Architecture

```
ARTEMIS I - Network Architecture
├── INTERNET (External Access)
│   ├── Port 80: HTTP - Public Monitoring Dashboard
│   └── Port 111: RPCbind
├── FIREWALL (iptables)
└── INTERNAL NETWORK (localhost only)
    ├── Port 25: SMTP (Postfix)
    ├── Port 8080: Admin Panel
    └── Port 3306: MySQL Database
```

## 🚀 Quick Start

### Local Testing

```bash
# Create network (first time only)
docker network create web-challenges

# Start the machine
docker-compose up -d

# Access the application
open http://localhost:8081
```

### Stop the Machine

```bash
docker-compose down
```

## 💡 Hints

### Flag 1 (Public)
- Check the main dashboard carefully
- The public API key is visible to everyone

### Flag 2 (User)
- The search functionality might be vulnerable
- SQL injection can reveal database contents
- Look for the `secrets` table

### Flag 3 (Admin)
- There's an admin panel running on port 8080
- It's only accessible from localhost
- You'll need to find a way to access internal services
- Default credentials might be in the database

### Flag 4 (Root)
- The root flag is in `/root/flags.txt`
- You'll need command execution or file read capabilities
- Look for potential RCE vulnerabilities
- Consider privilege escalation techniques

## 📚 Learning Objectives

- **SQL Injection**: UNION-based injection to extract data
- **SSRF**: Server-Side Request Forgery to access internal services
- **Firewall Bypass**: Techniques to access localhost-only services
- **Privilege Escalation**: Gaining root access
- **Multi-Stage Exploitation**: Chaining vulnerabilities

## 🔧 Technical Details

- **OS**: Ubuntu 22.04 LTS
- **Web Server**: Apache 2.4
- **Language**: PHP 8.1
- **Database**: MySQL 8.0
- **Mail Server**: Postfix
- **Firewall**: iptables
- **Exposed Ports**: 80 (HTTP), 111 (RPC)
- **Internal Ports**: 25 (SMTP), 8080 (Admin), 3306 (MySQL)

## ⚠️ Disclaimer

This machine is intentionally vulnerable for educational purposes. Never deploy this in a production environment!

## 📝 Tags

`sql-injection` `ssrf` `privilege-escalation` `firewall-bypass` `multi-stage` `web` `intermediate`

## 🏆 Scoring

- Public Flag: 100 points
- User Flag: 200 points
- Admin Flag: 300 points
- Root Flag: 400 points
- **Total**: 1000 points

## ⏱️ Estimated Time

2-4 hours for complete exploitation
