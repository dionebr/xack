#!/bin/bash

# Iniciar serviço cron
service cron start

# PEGADINHA FINAL: Mensagem de log enganosa
echo "[INFO] Iniciando serviços do sistema..."
echo "[WARN] Detecção de vulnerabilidades: Nenhuma encontrada" > /var/log/security.log

# Configurar permissões específicas para a flag escondida
chmod 700 /home/alex/.hidden
chmod 600 /home/alex/.hidden/.config/user.flag

# NONA PEGADINHA: Criar serviço falso na porta 8080
echo "Serviço de teste - Porta 8080" > /tmp/fake_service.html
python3 -m http.server 8080 --directory /tmp --bind 0.0.0.0 > /dev/null 2>&1 &

# Iniciar Tomcat na porta 9090 em PRIMEIRO PLANO (exec substitui o shell atual)
echo "=========================================="
echo "   Máquina CTF Mitchell - Pronta!"
echo "   Tomcat: http://localhost:9090"
echo "   Serviço falso: http://localhost:8080"
echo "   Usuário SSH: alex | Senha: Password123!"
echo "=========================================="

exec /usr/local/tomcat/bin/catalina.sh run
