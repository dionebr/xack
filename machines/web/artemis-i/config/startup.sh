#!/bin/bash

# Inicializar MySQL
service mysql start
sleep 3

# Criar banco de dados e usuário
mysql << 'EOF'
CREATE DATABASE IF NOT EXISTS artemis_monitoring;
CREATE USER IF NOT EXISTS 'artemis'@'localhost' IDENTIFIED BY 'uhc_artemis_2024';
GRANT ALL PRIVILEGES ON artemis_monitoring.* TO 'artemis'@'localhost';
FLUSH PRIVILEGES;
EOF

# Importar schema
mysql artemis_monitoring < /tmp/init-db.sql

# Configurar Postfix (modo local apenas)
postconf -e "inet_interfaces = loopback-only"
postconf -e "mydestination = artemis-i, localhost"
service postfix start

# Configurar iptables (firewall)
# Bloquear acesso externo às portas internas
iptables -A INPUT -p tcp --dport 3306 -i lo -j ACCEPT
iptables -A INPUT -p tcp --dport 3306 -j DROP
iptables -A INPUT -p tcp --dport 8080 -i lo -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j DROP
iptables -A INPUT -p tcp --dport 25 -i lo -j ACCEPT
iptables -A INPUT -p tcp --dport 25 -j DROP

# Iniciar Apache
service apache2 start

# Manter container rodando
tail -f /var/log/apache2/access.log
