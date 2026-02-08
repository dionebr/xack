# SQL Injection - Login Bypass Challenge

![Difficulty: Easy](https://img.shields.io/badge/Difficulty-Easy-green)
![Points: 100](https://img.shields.io/badge/Points-100-blue)
![Category: Web](https://img.shields.io/badge/Category-Web-orange)

## 📋 Description

A vulnerable login portal that demonstrates classic SQL injection vulnerabilities. Your mission is to bypass the authentication system and capture both flags.

## 🎯 Objectives

- **User Flag** (50 points): Bypass the login and access the admin panel
- **Root Flag** (50 points): Discover sensitive information in the system configuration

## 🚀 Quick Start

### Local Testing

```bash
# Create network (first time only)
docker network create web-challenges

# Start the challenge
docker-compose up -d

# Access the application
open http://localhost:8080
```

### Stop the Challenge

```bash
docker-compose down
```

## 💡 Hints

- The login form might not properly sanitize user input
- SQL comments can be useful: `--` or `#`
- Admin users might have access to sensitive information
- Check environment variables and configuration files

## 🏆 Flags

Submit flags in the format: `XACK{hash}`

- User Flag: Found in the admin panel after successful login
- Root Flag: Hidden in system configuration

## 📚 Learning Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger SQL Injection Labs](https://portswigger.net/web-security/sql-injection)
- [SQL Injection Cheat Sheet](https://www.netsparker.com/blog/web-security/sql-injection-cheat-sheet/)

## 🔧 Technical Details

- **OS**: Linux (Debian-based)
- **Web Server**: Apache 2.4
- **Language**: PHP 8.1
- **Database**: MySQL 8.0
- **Exposed Port**: 8080

## ⚠️ Disclaimer

This challenge is intentionally vulnerable for educational purposes. Never deploy this in a production environment!

## 📝 Tags

`sql-injection` `authentication-bypass` `web` `owasp-top-10` `beginner-friendly`
