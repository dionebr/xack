export const REPORT_TEMPLATE = (machineName: string) => `# EXECUTIVE SUMMARY
**Status:** Mission Accomplished  
**Target:** ${machineName}  
**Date:** ${new Date().toLocaleDateString()}  

Briefly describe the outcome of the mission. Did you acquire full root access? What was the critical vulnerability? 

> [!IMPORTANT]
> This report contains classified information regarding the exploitation of the ${machineName} system.

---

## 1. RECONNAISSANCE
Describe your initial scanning and enumeration steps.

### Nmap Scan Result
\`\`\`bash
nmap -sC -sV -p- <target-ip>
# Paste your scan results here...
\`\`\`

### Discovered Services
*   **Port 22 (SSH):** OpenSSH 8.2p1...
*   **Port 80 (HTTP):** Apache/2.4.41...

---

## 2. VULNERABILITY ANALYSIS
Explain the vulnerability you discovered. How did you identify it?

> [!NOTE]
> Example: "I found a vulnerable plugin on the web server..."

---

## 3. EXPLOITATION
Step-by-step guide on how you exploited the system.

1.  Crafted a malicious payload...
2.  Sent the request to...
3.  Received a reverse shell.

\`\`\`python
# Payload example
print("Hacking in progress...")
\`\`\`

---

## 4. PRIVILEGE ESCALATION
How did you move from user to root?

### User Flag
> **Proof:** \`xack{user_flag_here}\`

### Root Flag
> **Proof:** \`xack{root_flag_here}\`

---

## 5. REMEDIATION
(Optional) Recommended fixes for the vulnerabilities found.
*   Update Apache Tomcat to version...
*   Disable unneeded services...
`;
