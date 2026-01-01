-- Update Levels
UPDATE public.roadmap_levels SET 
title = 'LEVEL 0 – FOUNDATIONS', 
description = 'The Source of Truth. Where it all begins.' 
WHERE order_index = 0;

UPDATE public.roadmap_levels SET 
title = 'LEVEL 1 – IT BASE', 
description = 'Where 90% quit. Programming, Data, and Web.' 
WHERE order_index = 1;

UPDATE public.roadmap_levels SET 
title = 'LEVEL 2 – SECURITY FUNDAMENTALS', 
description = 'Understanding defense to execute attack.' 
WHERE order_index = 2;

UPDATE public.roadmap_levels SET 
title = 'LEVEL 3 – PENTEST', 
description = 'The game begins. Methodology and Tools.' 
WHERE order_index = 3;

UPDATE public.roadmap_levels SET 
title = 'LEVEL 4 – RED TEAM', 
description = 'Attacker mindset. Adversary simulation.' 
WHERE order_index = 4;

UPDATE public.roadmap_levels SET 
title = 'LEVEL 5 – PROFESSIONAL', 
description = 'Reporting, Market, and Ethics.' 
WHERE order_index = 5;

-- Update Modules (by name matching or ID assumption - safer to use name matching)
UPDATE public.roadmap_modules SET title = 'Operating Systems' WHERE title = 'Sistemas Operacionais';
UPDATE public.roadmap_modules SET title = 'Computer Networks' WHERE title = 'Redes de Computadores';
UPDATE public.roadmap_modules SET title = 'Programming' WHERE title = 'Programação';
UPDATE public.roadmap_modules SET title = 'Databases' WHERE title = 'Bancos de Dados';
UPDATE public.roadmap_modules SET title = 'Web Deep Dive' WHERE title = 'Web Deep Dive'; -- Already OK
UPDATE public.roadmap_modules SET title = 'Essential Concepts' WHERE title = 'Conceitos Essenciais';
UPDATE public.roadmap_modules SET title = 'System Security' WHERE title = 'Segurança de Sistemas';
UPDATE public.roadmap_modules SET title = 'Methodology' WHERE title = 'Metodologia';
UPDATE public.roadmap_modules SET title = 'Tools' WHERE title = 'Ferramentas';
UPDATE public.roadmap_modules SET title = 'Red Team Ops' WHERE title = 'Red Team Ops'; -- Already OK
UPDATE public.roadmap_modules SET title = 'Active Directory' WHERE title = 'Active Directory'; -- Already OK
UPDATE public.roadmap_modules SET title = 'Career & Ethics' WHERE title = 'Carreira & Ética';
-- Topics update (batch update for simplicity)
UPDATE public.roadmap_topics SET title = 'General Concepts (Kernel, Threads, Memory)' WHERE title = 'Conceitos gerais (Kernel, Threads, Memory)';
UPDATE public.roadmap_topics SET title = 'Linux (Structure, Permissions, Bash)' WHERE title = 'Linux (Estrutura, Permissões, Bash)';
UPDATE public.roadmap_topics SET title = 'Windows (Registry, Services, AD basics)' WHERE title = 'Windows (Registry, Services, AD basics)';

UPDATE public.roadmap_topics SET title = 'Fundamentals (LAN, WAN, VPN)' WHERE title = 'Fundamentos (LAN, WAN, VPN)';
UPDATE public.roadmap_topics SET title = 'OSI & TCP/IP Models' WHERE title = 'Modelos OSI e TCP/IP';
UPDATE public.roadmap_topics SET title = 'Protocols (TCP, UDP, HTTP, DNS)' WHERE title = 'Protocolos (TCP, UDP, HTTP, DNS)';
UPDATE public.roadmap_topics SET title = 'Addressing (IPv4/v6, Subnetting)' WHERE title = 'Endereçamento (IPv4/v6, Subnetting)';
UPDATE public.roadmap_topics SET title = 'Tools (Ping, Wireshark)' WHERE title = 'Ferramentas (Ping, Wireshark)';

UPDATE public.roadmap_topics SET title = 'Programming Logic' WHERE title = 'Lógica de Programação';
UPDATE public.roadmap_topics SET title = 'Python (Scripts, Sockets)' WHERE title = 'Python (Scripts, Sockets)'; -- Stay same
UPDATE public.roadmap_topics SET title = 'JavaScript & Bash' WHERE title = 'JavaScript & Bash'; -- Stay same

UPDATE public.roadmap_topics SET title = 'Concepts & Basic SQL' WHERE title = 'Conceitos e SQL Básico';

UPDATE public.roadmap_topics SET title = 'HTML/CSS/JS' WHERE title = 'HTML/CSS/JS'; -- Stay same
UPDATE public.roadmap_topics SET title = 'HTTP in Practice (Headers, Cookies)' WHERE title = 'HTTP na prática (Headers, Cookies)';
UPDATE public.roadmap_topics SET title = 'Back-end APIs' WHERE title = 'Back-end APIs'; -- Stay same

UPDATE public.roadmap_topics SET title = 'CIA Triad' WHERE title = 'CIA Triad';
UPDATE public.roadmap_topics SET title = 'Cryptography' WHERE title = 'Criptografia';

UPDATE public.roadmap_topics SET title = 'Hardening Linux & Windows' WHERE title = 'Hardening Linux & Windows';

UPDATE public.roadmap_topics SET title = 'Recon & Enumeration' WHERE title = 'Recon & Enumeração';
UPDATE public.roadmap_topics SET title = 'Exploitation & Post-exploitation' WHERE title = 'Exploração & Pós-exploração';

UPDATE public.roadmap_topics SET title = 'Nmap, Burp, Metasploit' WHERE title = 'Nmap, Burp, Metasploit';

UPDATE public.roadmap_topics SET title = 'Adversary Simulation' WHERE title = 'Simulação de Adversário';
UPDATE public.roadmap_topics SET title = 'Domain, Kerberos, NTLM' WHERE title = 'Domain, Kerberos, NTLM';

UPDATE public.roadmap_topics SET title = 'Technical Reports' WHERE title = 'Relatórios Técnicos';
UPDATE public.roadmap_topics SET title = 'Market & Compliance' WHERE title = 'Mercado e Compliance';

