---
trigger: always_on
---

🏴‍☠️ Projeto BlackDomain — Ambiente Active Directory Real para CTF
📘 Objetivo

Criar um ambiente realista e automatizado com:

Windows Server 2019 (AD DS + DNS)

Duas estações Windows 10

Um servidor Ubuntu com ELK ou Wazuh para logs

Uma topologia de rede isolada igual à da imagem (subnet de servidores e de workstations)

Flags e vulnerabilidades para exploração controlada

Vulnerabilidades

Enumeração de domínio e usuários

Exploração de compartilhamentos SMB

Busca de senhas em texto claro

Password spraying (simulação controlada)

Uso do privilégio SeBackupPrivilege

🧰 Requisitos do Host
Requisito	Valor mínimo
Sistema Host	Windows 10/11, macOS ou Linux
RAM	16 GB (recomendado: 24 GB)
CPU	6 núcleos
Armazenamento	60 GB livres
Ferramentas	Vagrant
, VirtualBox
, Git
⚙️ Estrutura de Rede
Subnet	Descrição	Intervalo IP
Servers subnet	Controlador de domínio + servidor de logs	10.10.10.0/24
Workstations subnet	Máquinas Windows 10 unidas ao domínio	10.10.20.0/24
Virtual network	Rede interna privada (sem internet externa)	Isolada
📁 Estrutura de diretórios
BlackDomain/
├── Vagrantfile
├── provisioning/
│   ├── dc_setup.ps1
│   ├── ws_setup.ps1
│   ├── logserver_setup.sh
│   └── flags/
│       ├── flag1.txt
│       ├── flag2.txt
│       └── flag3.txt
└── README.md

🧱 1. Clonar base e preparar ambiente
git clone https://github.com/christophetd/Adaz.git BlackDomain
cd BlackDomain


Agora substituíremos o Vagrantfile e os scripts de provisionamento com os adaptados abaixo.

🪟 2. Vagrantfile adaptado

Crie ou substitua o arquivo Vagrantfile:

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box_check_update = false

  # Rede isolada para o domínio
  config.vm.network "private_network", ip: "10.10.10.1"

  ### === CONTROLADOR DE DOMÍNIO === ###
  config.vm.define "dc01" do |dc|
    dc.vm.box = "gusztavvargadr/windows-server-2019"
    dc.vm.hostname = "dc01.blackdomain.local"
    dc.vm.network "private_network", ip: "10.10.10.10"
    dc.vm.provider "virtualbox" do |vb|
      vb.name = "BlackDomain-DC"
      vb.memory = 4096
      vb.cpus = 2
    end
    dc.vm.provision "shell", path: "provisioning/dc_setup.ps1"
  end

  ### === WORKSTATION 1 === ###
  config.vm.define "ws01" do |ws1|
    ws1.vm.box = "gusztavvargadr/windows-10"
    ws1.vm.hostname = "ws01.blackdomain.local"
    ws1.vm.network "private_network", ip: "10.10.20.11"
    ws1.vm.provider "virtualbox" do |vb|
      vb.name = "BlackDomain-WS01"
      vb.memory = 4096
      vb.cpus = 2
    end
    ws1.vm.provision "shell", path: "provisioning/ws_setup.ps1"
  end

  ### === WORKSTATION 2 === ###
  config.vm.define "ws02" do |ws2|
    ws2.vm.box = "gusztavvargadr/windows-10"
    ws2.vm.hostname = "ws02.blackdomain.local"
    ws2.vm.network "private_network", ip: "10.10.20.12"
    ws2.vm.provider "virtualbox" do |vb|
      vb.name = "BlackDomain-WS02"
      vb.memory = 4096
      vb.cpus = 2
    end
    ws2.vm.provision "shell", path: "provisioning/ws_setup.ps1"
  end

  ### === SERVIDOR DE LOGS === ###
  config.vm.define "logsrv" do |log|
    log.vm.box = "ubuntu/jammy64"
    log.vm.hostname = "logsrv.blackdomain.local"
    log.vm.network "private_network", ip: "10.10.10.20"
    log.vm.provider "virtualbox" do |vb|
      vb.name = "BlackDomain-LOG"
      vb.memory = 2048
      vb.cpus = 2
    end
    log.vm.provision "shell", path: "provisioning/logserver_setup.sh"
  end
end

🧩 3. Script do Controlador de Domínio

Arquivo: provisioning/dc_setup.ps1

Esse script:

Promove o servidor a DC

Cria o domínio BlackDomain.local

Adiciona usuários vulneráveis

Configura permissões fracas e flags

# Instalar AD DS
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools

# Criar o domínio
Install-ADDSForest `
  -DomainName "BlackDomain.local" `
  -DomainNetbiosName "BLACKDOMAIN" `
  -SafeModeAdministratorPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
  -Force:$true

# Criar usuários vulneráveis
New-ADUser -Name "alice" -AccountPassword (ConvertTo-SecureString "Password123" -AsPlainText -Force) -Enabled $true
New-ADUser -Name "bob" -AccountPassword (ConvertTo-SecureString "Password123" -AsPlainText -Force) -Enabled $true
New-ADUser -Name "backup" -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) -Enabled $true
Add-ADGroupMember -Identity "Domain Admins" -Members "backup"

# Compartilhamento vulnerável
New-Item -Path "C:\Shares\Public" -ItemType Directory
New-SmbShare -Name "Public" -Path "C:\Shares\Public" -FullAccess "Everyone"

# Inserir flag
New-Item -Path "C:\Shares\Public\flag1.txt" -Value "FLAG{DC_FULL_ACCESS}" -Force

💻 4. Script das Estações Windows

Arquivo: provisioning/ws_setup.ps1

$domain = "BlackDomain.local"
$password = ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ("Administrator", $password)

Add-Computer -DomainName $domain -Credential $cred -Force -Restart

# Após reinício: simular senhas salvas em arquivo
New-Item -Path "C:\Users\Public\Documents\passwords.txt" -Value "backup:P@ssw0rd!" -Force
New-Item -Path "C:\Users\Public\Documents\flag2.txt" -Value "FLAG{FOUND_PASSWORD}" -Force

🐧 5. Servidor de Logs (Linux)

Arquivo: provisioning/logserver_setup.sh

#!/bin/bash
apt update && apt install -y docker.io docker-compose
mkdir -p /opt/wazuh
cd /opt/wazuh

curl -so docker-compose.yml https://packages.wazuh.com/4.8/docker-compose.yml
docker-compose up -d
echo "FLAG{LOG_MONITOR_ACTIVE}" > /opt/wazuh/flag3.txt

🏁 6. Execução
vagrant up


A ordem automática:

dc01 sobe e cria o domínio

ws01 e ws02 se juntam ao domínio

logsrv inicia o Wazuh e começa a coletar eventos

Você terá uma topologia real de AD completa e pronta para CTF.

🎯 7. Desafios/Flags sugeridos
Flag	Local	Dica
FLAG{DC_FULL_ACCESS}	\\dc01\Public\flag1.txt	Enumere o share SMB
FLAG{FOUND_PASSWORD}	C:\Users\Public\Documents\	Procure senhas salvas
FLAG{LOG_MONITOR_ACTIVE}	/opt/wazuh/	Acesse o servidor de logs
FLAG{SE_BACKUP_PRIV}	Ganho via SeBackupPrivilege	Obtenha privilégio total

projeto referencia: https://github.com/christophetd/Adaz - caminho do projeto para ser baseado C:\xampp\htdocs\xack\Adaz-main