# 🚀 XACK Platform - Deployment Guide

## Arquitetura de Produção

**Modelo Híbrido:**
- **Plataforma (Bare Metal)**: Backend (Node.js + PM2), Frontend (Nginx), MySQL
- **Challenges (Docker)**: Labs isolados em containers conforme `/opt/xack/orchestrator/`

---

## 📋 Pré-requisitos

- Ubuntu 24.04 LTS
- Node.js 18+
- MySQL 8.0
- Nginx
- PM2
- Git

---

## 🔧 Setup Inicial na VPS

### 1. Clonar Repositório
```bash
cd /opt
git clone https://github.com/dionebr/xack.git
cd xack
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

### 3. Configurar Banco de Dados
```bash
# Importar schema
mysql -u root -p < /opt/xack/database.sql

# Criar usuário (via MySQL interativo)
mysql -u root -p
```

```sql
CREATE USER 'xack_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SUA_SENHA_AQUI';
GRANT ALL PRIVILEGES ON xack_platform.* TO 'xack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configurar PM2
```bash
cd /opt/xack/backend

# Editar ecosystem.config.js com suas credenciais
nano ecosystem.config.js

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configurar Nginx
```bash
# Copiar configuração
sudo cp /opt/xack/nginx_vps.conf /etc/nginx/sites-available/xack
sudo ln -s /etc/nginx/sites-available/xack /etc/nginx/sites-enabled/

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Build do Frontend
```bash
cd /opt/xack
npm install
npm run build

# Nginx serve os arquivos de /opt/xack/dist
```

---

## 🔄 Deploy de Atualizações

### Workflow Local → GitHub → VPS

**No seu ambiente local (Windows):**
```powershell
# Sincronizar mudanças
./sync_prod.ps1
```

**Na VPS:**
```bash
cd /opt/xack

# Puxar atualizações
git pull origin master

# Atualizar backend
cd backend
npm install
pm2 restart xack-backend

# Atualizar frontend (se necessário)
cd ..
npm install
npm run build
```

---

## 🔍 Monitoramento

### Logs do Backend
```bash
pm2 logs xack-backend
pm2 logs xack-backend --lines 50
```

### Status dos Serviços
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql
```

### Logs do Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🛠️ Troubleshooting

### Backend não conecta ao MySQL
```bash
# Verificar se o usuário tem permissões
mysql -u xack_user -p'SUA_SENHA' -e "SELECT 1;"

# Verificar logs
pm2 logs xack-backend --lines 20
```

### Erro 502 Bad Gateway
```bash
# Verificar se o backend está rodando
pm2 status

# Verificar porta 3001
sudo netstat -tulpn | grep 3001

# Reiniciar backend
pm2 restart xack-backend
```

### Frontend não carrega
```bash
# Verificar se o build existe
ls -la /opt/xack/dist

# Rebuild
cd /opt/xack
npm run build

# Verificar permissões
sudo chown -R www-data:www-data /opt/xack/dist
```

---

## 🔐 Segurança

### Variáveis de Ambiente
- **Nunca** commitar `ecosystem.config.js` com senhas reais
- Usar senhas fortes (mínimo 16 caracteres)
- JWT_SECRET deve ser único e criptograficamente seguro

### Firewall
```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 📊 Estrutura de Arquivos

```
/opt/xack/
├── backend/
│   ├── server.js              # Aplicação principal
│   ├── ecosystem.config.js    # Configuração PM2
│   └── package.json
├── dist/                      # Frontend buildado (Nginx)
├── orchestrator/              # Scripts de gerenciamento de labs
├── database.sql               # Schema do banco
├── nginx_vps.conf             # Configuração Nginx
└── sync_prod.ps1              # Script de sincronização
```

---

## ✅ Checklist de Deploy

- [ ] MySQL configurado e rodando
- [ ] Usuário `xack_user` criado com permissões
- [ ] Backend rodando via PM2
- [ ] Nginx configurado e servindo frontend
- [ ] Frontend buildado em `/opt/xack/dist`
- [ ] Firewall configurado
- [ ] PM2 configurado para iniciar no boot
- [ ] Logs sendo monitorados

---

## 🆘 Suporte

Em caso de problemas, verificar:
1. Logs do PM2: `pm2 logs xack-backend`
2. Logs do Nginx: `/var/log/nginx/error.log`
3. Logs do MySQL: `/var/log/mysql/error.log`
