
import { Machine, Event, User, News, Path, AuditLog } from './types';

interface AssetsType {
  LOGO: string;
  creatorPortrait: string;
  creatorPhoto: string;
  avatar: string;
  eventHero: string;
  track1: string;
  track2: string;
  track3: string;
  track4: string;
  flagUS: string;
  flagBR: string;
  notificationSound: string;
  nudgeSound: string;
  [key: string]: string; // Allow other string keys
}

export const ASSETS: AssetsType = {
  LOGO: '/assets/images/logo.svg',
  creatorPortrait: '/assets/images/profile.png',
  creatorPhoto: '/assets/images/profile.png',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXHrt_4GxI8atJPv498sWhdsQvtvBZId_-RuPY9IkHlZ7lH5oHLfUKVKRS07yKK8uO66rentIcy-cSfYtj6xSNYA-cpABZXo-irauzoH5Hbg6XhCx9bfRQb1bRdvur2DI6PljSaHPd5VfeYkL2pDjCUncHhDHUW5tX9hmbOUrhJ6Y1K9azq8NW8AHsmKaUFB9PqvSY1A96WQoZyJgsxSsHDrb0EbaB8QhIkn288FQHbEHTUlu5YhDKD8swyv9_KedCZAX1M2s9ltrs',
  eventHero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0W93S5gmOyD6xvDaFkOSYUjQC_xlgxll-baw7_dvIRgg5pytM--6gcCnAVnehT5ZF84p0Ntj77I3sKCQkoH5oQfukiNZImxcJScVxqX_MRfl9pa8gz39_0kU-Z8zdKQ1WhVbByc1L8_KUoIyBJQCy9v40IuqdesEGAC52C_AKfr1h4UQPLMgBpRU2k012mdMo9H50lQevMYNJBr-jyCGBJ5lUEeuYkhX3wk_NRgODFekpJs9Qj9Z7ZcG_myiz8XHpplVtt91xI92B',
  track1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB43JrKK1U7Uq1E3MZDAaEUtBS7g2hCF9eACasHIKiEkhV9RJQmPhnbKpzlCZGoKpusQIIq8-zXVRvsVJjOeqXwWzRakBBuyGZwrOi_fVygpo_dr6ZOYuFjTvCW-VJ18gLZdcHPKVi63XPYeaJu9TkmM0cmUSbDSwzv-_zWkWw29a0PEuRe0E2vldvTnC10j9BQuqhN2e4yCmwbUOa2w9Vvj1wL4pnGuVLrNNhYLPyhVfBKQZHwksp-fnZPgp8WwA7MpyptWp71G7q5',
  track2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPjX_PWAn9ub-TgXv-BR_eHLN_WFN_s9cBVm_QX0tCTfdB8Zwkk4Z7aQ5-fmhyZxp-nrvKYQrnfcOXq72Vf6QhVaC28JvBfZbZyCu98SF6VQkZ9Hd-Yq8qNkn8P_aCh5qax996EqVyhhptp4iPIYLujfH9pivxFo8rihONFQuMtGMXo9jD4M3KNd6N4VcGzAQR7hG2CfO0hnCVIVFpWAejg0HRy0RvO-dyhMv2VmmFA6bZP1Crut_xDkOQpJevqo0thURlR6OOdhLF',
  track3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0jpjnATdpoRQtaiIyv69Xo93bA5sZfvfNZHC5F9UHbKq3R15gFoYlbJX-31e-FS6joDm5cYoVb3qoZOBSOZTOR7BIjZFH7CfPc_OS8N03KYnGtr1BY6yTrFj9KRMWeW7EGI3VDufjAi8K4p-tAl3IvLzQmEXjc7CVliOavgE79zHW4qx9k9yPUZYKkbVL1ldlXlEyVL_djHX82fcs8mw5yCnexno_iJOJb2XyUhewobT8wYNHMwP9MhHpPekHpXjGYAE-cFzd4C9G',
  track4: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIBbbIg6ZJlMy3ADhIGMdTdvZglvfRNTXInGyfagcq4k-3AgWLGtZnPeT5Y4_zlPggGMLnHT6YzuoubhmGJDjVmIrUQSqm4r8ISfxPdeJ2p91zuNopwXaWLQ8bS684bzIzt8munqX8KkrX6CnlNAOHpMtiqLBk_UtkUxgibtpvCbgCcdaYWl9aF51gzUbWWdQxiSoSQqQKvE3CsC0NeQ1H01iZ4q9OPfA7nIW4L2FuA9afj5mgMc6ZxnR_PpjzHEsaXojEXD0pecUk',
  flagUS: 'https://flagcdn.com/w40/us.png',
  flagBR: 'https://flagcdn.com/w40/br.png',
  notificationSound: '/assets/sounds/notification.mp3',
  nudgeSound: '/assets/sounds/nudge.mp3',
  // Sounds removed in favor of Web Audio API implementation
  // buzzSound: removed
  // notificationSound: removed
};

export const MOCK_MACHINES: any[] = [
  {
    id: 'mitchell',
    name: 'Mitchell',
    image: '/assets/machines/mitchell.png',
    category: 'web',
    difficulty: 'MEDIUM',
    points: 50,
    os: 'Linux',
    overview: 'A vulnerable Tomcat server with multiple red herrings and privilege escalation via misconfigured cron job.',
    objective: 'Exploit the Manager App, find hidden flags, and escalate to root.',
    attackSurface: 'Tomcat (9090), HTTP (8080).',
    skillsRequired: 'Tomcat Exploitation, Cron PrivEsc.',
    estimatedTime: '90-120 minutes',
    rules: 'No DoS. Brute force allowed on Tomcat Manager.',
    toolsAllowed: 'nmap, msfconsole, burp suite.',
    environmentInfo: 'Ubuntu 20.04. Tomcat 8.5.',
    hintsPolicy: 'Standard XP costs apply.',
    learningGoals: 'Tomcat Manager abuse and Linux persistence via cron.',
    prerequisites: 'Basic web and Linux knowledge.',
    knownIssues: 'None.',
    changelog: 'v1.0 - Initial release.',
    authorNotes: 'Watch out for red herrings.',
    hints: [
      { id: 'h1', text: 'Tomcat is on port 9090.', cost: 10, isUnlocked: false },
      { id: 'h2', text: 'Check cron jobs for root processes.', cost: 20, isUnlocked: false }
    ],
    openPorts: [9090, 8080]
  },
  {
    id: '1',
    name: 'Protocol Omega',
    image: ASSETS.track1,
    difficulty: 'HARD',
    points: 80,
    os: 'Linux',
    overview: 'A government facility isolated network using an encrypted legacy protocol for high-priority communications.',
    objective: 'Gain root access and exfiltrate the master flag from /root/master.txt.',
    attackSurface: 'SSH (22), HTTP (80), Custom Omega Protocol (8888). Vulnerable legacy web apps.',
    skillsRequired: 'Protocol Analysis, Web Hacking, Privilege Escalation (Sudo).',
    estimatedTime: '60-90 minutes',
    rules: 'No DoS attacks. Brute force is not required. Subnet scanning allowed.',
    toolsAllowed: 'nmap, burp suite, ffuf, msfconsole.',
    environmentInfo: 'Custom Ubuntu 22.04 LTS. Real-world corporate network simulation.',
    hintsPolicy: '3 clues available. Cost: 10 XP each.',
    learningGoals: 'Understanding TCP protocols and container misconfigurations.',
    prerequisites: 'Linux CLI proficiency and HTTP header analysis.',
    knownIssues: 'Port 8888 stability takes 60s after spawn.',
    changelog: 'v1.2 - Kernel update; v1.0 - Initial release.',
    authorNotes: 'Inspired by a 2022 incident. Focus on technical analysis, not guessing.',
    hints: [
      { id: 'h1', text: 'Check headers on port 8888 for version leaks.', cost: 10, isUnlocked: false },
      { id: 'h2', text: 'Look for .secret_config in the web root.', cost: 15, isUnlocked: false }
    ],
    openPorts: [22, 80, 8888]
  },
  {
    id: '2',
    name: 'Cloud Leak',
    image: ASSETS.track2,
    difficulty: 'EASY',
    points: 20,
    os: 'Linux',
    overview: 'A misconfigured cloud storage bucket exposed through a simple landing page.',
    objective: 'Identify the leaked credentials and access the internal database.',
    attackSurface: 'HTTP (80), S3 Bucket exposure.',
    skillsRequired: 'Cloud Recon, Basic Web Hacking.',
    estimatedTime: '20-30 minutes',
    rules: 'Standard CTF rules apply.',
    toolsAllowed: 'nmap, aws-cli, gobuster.',
    environmentInfo: 'Alpine Linux. Lightweight didatic environment.',
    hintsPolicy: 'Free hints after 15 minutes of activity.',
    learningGoals: 'AWS S3 permissions and public bucket discovery.',
    prerequisites: 'Basic web navigation and terminal usage.',
    knownIssues: 'None.',
    changelog: 'v1.0 - Launch.',
    authorNotes: 'Perfect for beginners starting in Cloud Security.',
    hints: [{ id: 'h1', text: 'Enumerate the JS files for API keys.', cost: 0, isUnlocked: false }],
    openPorts: [80]
  },
  {
    id: '3',
    name: 'Silent Echo',
    image: ASSETS.track3,
    difficulty: 'MEDIUM',
    points: 45,
    os: 'Windows',
    overview: 'An old Windows server running a vulnerable printer service on a corporate intranet.',
    objective: 'Exploit the Print Spooler and gain Administrative rights.',
    attackSurface: 'SMB (445), RPC (135), Print Spooler (631).',
    skillsRequired: 'SMB Enumeration, Windows PrivEsc, RPC calls.',
    estimatedTime: '45-60 minutes',
    rules: 'No automated scanners like Nessus allowed.',
    toolsAllowed: 'nmap, crackmapexec, impacket.',
    environmentInfo: 'Windows Server 2019. Domain controller simulation.',
    hintsPolicy: 'Hints cost 5 XP and are unlocked sequentially.',
    learningGoals: 'Active Directory basics and SMB exploitation.',
    prerequisites: 'Understanding of Windows authentication and SMB protocols.',
    knownIssues: 'SMB response can be slow under heavy load.',
    changelog: 'v1.1 - Patched unintended path; v1.0 - Release.',
    authorNotes: 'Test your lateral movement skills here.',
    hints: [{ id: 'h1', text: 'Guest login is enabled on SMB.', cost: 5, isUnlocked: false }],
    openPorts: [135, 445]
  },
  {
    id: '4',
    name: 'Iron Sentry',
    image: ASSETS.track4,
    difficulty: 'HARD',
    points: 100,
    os: 'Linux',
    overview: 'A hardened gateway protected by a multi-stage authentication system.',
    objective: 'Bypass the WAF and find the hidden control panel.',
    attackSurface: 'HTTPS (443), SSH (2222), API (3000).',
    skillsRequired: 'WAF Bypass, API Fuzzing, Kernel Exploitation.',
    estimatedTime: '120 minutes',
    rules: 'Aggressive scanning forbidden.',
    toolsAllowed: 'Burp Suite Pro, ffuf, custom scripts.',
    environmentInfo: 'Ubuntu Hardened. Advanced defense mechanisms.',
    hintsPolicy: 'Very limited hints. Use Discord for community support.',
    learningGoals: 'Advanced web security and bypass techniques.',
    prerequisites: 'Expert level web exploitation and scripting.',
    knownIssues: 'WAF might block IPs for 1 minute on excessive errors.',
    changelog: 'v2.0 - Total rework of the auth logic.',
    authorNotes: 'One of the hardest machines in this season.',
    hints: [{ id: 'h1', text: 'The WAF uses a regex based on user-agents.', cost: 20, isUnlocked: false }],
    openPorts: [443, 2222, 3000]
  },
  {
    id: '5',
    name: 'Web Crawler',
    image: ASSETS.track1,
    difficulty: 'EASY',
    points: 15,
    os: 'Linux',
    overview: 'A simple blog with basic SQL vulnerabilities in the search bar.',
    objective: 'Extract the admin password from the database.',
    attackSurface: 'HTTP (80), MySQL (3306).',
    skillsRequired: 'SQL Injection, Manual Enumeration.',
    estimatedTime: '15-20 minutes',
    rules: 'Don\'t delete database records.',
    toolsAllowed: 'sqlmap, burp suite.',
    environmentInfo: 'Debian. Standard LAMP stack.',
    hintsPolicy: 'Walkthrough available for premium users.',
    learningGoals: 'Mastering classic SQLi techniques.',
    prerequisites: 'Basic SQL queries understanding.',
    knownIssues: 'None.',
    changelog: 'v1.0 - Launch.',
    authorNotes: 'Classic challenge for training SQLi.',
    hints: [],
    openPorts: [80, 3306]
  },
  {
    id: '6',
    name: 'Shadow Proxy',
    image: ASSETS.track2,
    difficulty: 'MEDIUM',
    points: 40,
    os: 'Linux',
    overview: 'A proxy server used to hide internal traffic with a misconfigured Nginx setup.',
    objective: 'Bypass proxy restrictions and access the internal dashboard.',
    attackSurface: 'HTTP (80), Proxy (8080).',
    skillsRequired: 'SSRF, Proxy Bypassing, Nginx config analysis.',
    estimatedTime: '40-50 minutes',
    rules: 'Standard engagement rules.',
    toolsAllowed: 'curl, burp suite, ffuf.',
    environmentInfo: 'CentOS. Focused on networking misconfigurations.',
    hintsPolicy: 'Standard XP costs apply.',
    learningGoals: 'Server-Side Request Forgery (SSRF) and proxy chains.',
    prerequisites: 'Intermediate networking and HTTP protocol knowledge.',
    knownIssues: 'Internal port changes every 12 hours.',
    changelog: 'v1.0 - Release.',
    authorNotes: 'Networking is key here.',
    hints: [],
    openPorts: [80, 8080]
  },
  {
    id: '7',
    name: 'Binary Pulse',
    image: ASSETS.track3,
    difficulty: 'HARD',
    points: 90,
    os: 'Linux',
    overview: 'A proprietary binary running as a service with a buffer overflow vulnerability.',
    objective: 'Craft an exploit to get a reverse shell.',
    attackSurface: 'Custom Binary (1337).',
    skillsRequired: 'Binary Exploitation, Shellcoding, GDB.',
    estimatedTime: '90-120 minutes',
    rules: 'No automated exploit tools.',
    toolsAllowed: 'gdb, pwntools, python3.',
    environmentInfo: 'Ubuntu 20.04. ASLR and NX enabled.',
    hintsPolicy: 'Hints are cryptic and for advanced users.',
    learningGoals: 'Buffer overflow and DEP/ASLR bypass.',
    prerequisites: 'C programming and assembly basics.',
    knownIssues: 'Memory offsets might differ slightly per spawn.',
    changelog: 'v1.3 - Fixed shellcode constraint.',
    authorNotes: 'Bring your assembly skills.',
    hints: [],
    openPorts: [1337]
  },
  {
    id: '8',
    name: 'Zero Day',
    image: ASSETS.track4,
    difficulty: 'MEDIUM',
    points: 55,
    os: 'Windows',
    overview: 'Simulating a fresh exploit in a patched Windows environment.',
    objective: 'Find the one missing patch that allows privilege escalation.',
    attackSurface: 'RDP (3389), WinRM (5985).',
    skillsRequired: 'Windows Enumeration, Patch Analysis.',
    estimatedTime: '50-70 minutes',
    rules: 'Standard rules.',
    toolsAllowed: 'winpeas, nmap, evil-winrm.',
    environmentInfo: 'Windows 10. Modern desktop simulation.',
    hintsPolicy: 'Points cost is higher for patch-specific info.',
    learningGoals: 'Post-exploitation on modern Windows systems.',
    prerequisites: 'Active Directory and Windows service knowledge.',
    knownIssues: 'WinRM might require custom credentials.',
    changelog: 'v1.0 - Initial.',
    authorNotes: 'Don\'t forget to check the system logs.',
    hints: [],
    openPorts: [3389, 5985]
  }
];

export const MOCK_PATHS: Path[] = [
  { id: 'p1', title: 'Offensive Architect', level: 'ADVANCED', progress: 65, challenges: 12, icon: 'architecture', color: '#b946e9' },
  { id: 'p2', title: 'Network Infiltrator', level: 'INTERMEDIATE', progress: 40, challenges: 8, icon: 'lan', color: '#00f0ff' },
  { id: 'p3', title: 'Security Fundamentals', level: 'BEGINNER', progress: 100, challenges: 5, icon: 'school', color: '#22c55e' }
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l1', action: 'FLAG_SUBMIT_SUCCESS', timestamp: '2023-10-24 14:22:01', ip: '189.12.33.1', status: 'SUCCESS' },
  { id: 'l2', action: 'RATE_LIMIT_TRIGGERED', timestamp: '2023-10-24 14:18:55', ip: '189.12.33.1', status: 'WARNING' },
  { id: 'l3', action: 'VPN_SESSION_STARTED', timestamp: '2023-10-24 13:00:10', ip: '189.12.33.1', status: 'SUCCESS' }
];

export const MOCK_LEADERBOARD: User[] = [
  { username: 'Dione Lima', level: 99, badges: 42, rank: 1, avatar: ASSETS.creatorPortrait, score: 999999, country: 'Brazil' },
  { username: 'Maria Septimus', level: 88, badges: 14, rank: 2, avatar: ASSETS.track1, score: 94200, country: 'USA' }
];

export const MOCK_NEWS: News[] = [
  { id: 'n1', title: 'New Challenge Category: IoT Exploitation', category: 'Platform Update', date: '2 hours ago', image: ASSETS.track4, summary: '...' }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Legends Arena Season 2024',
    description: 'The world\'s most intense Capture The Flag competition.',
    image: ASSETS.eventHero,
    date: '2024-10-24',
    type: 'CTF',
    prizePool: '$50,000',
    registeredTeams: 128
  }
];
