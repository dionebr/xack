#!/bin/bash
# artemis_ctf_setup.sh
# Script completo de instalação da máquina Artemis I
# Execute como root: sudo bash artemis_ctf_setup.sh

echo "=============================================="
echo "CONFIGURAÇÃO DA MÁQUINA CTF ARTEMIS I"
echo "Baseado na máquina 'Reader' do UHC Labs"
echo "=============================================="

# ============================================================================
# 1. CONFIGURAÇÃO INICIAL DO SISTEMA
# ============================================================================
echo "[1/10] Configurando sistema base..."

# Atualizar repositórios
apt update
apt upgrade -y

# Instalar pacotes necessários
apt install -y \
    apache2 \
    php \
    libapache2-mod-php \
    php-curl \
    php-mysql \
    mysql-server \
    postfix \
    iptables-persistent \
    net-tools \
    curl \
    wget \
    git \
    unzip \
    netcat \
    tree \
    nmap

# Configurar timezone (ajuste conforme sua região)
timedatectl set-timezone America/Sao_Paulo

# ============================================================================
# 2. CONFIGURAR FIREWALL (IPTABLES)
# ============================================================================
echo "[2/10] Configurando firewall..."

# Limpar regras existentes
iptables -F
iptables -X
iptables -Z

# Configurar políticas padrão
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Permitir loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Permitir conexões estabelecidas e relacionadas
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Permitir serviços públicos
iptables -A INPUT -p tcp --dport 22 -j ACCEPT    # SSH
iptables -A INPUT -p tcp --dport 80 -j ACCEPT    # HTTP
iptables -A INPUT -p tcp --dport 111 -j ACCEPT   # RPCbind

# Permitir serviços internos APENAS para localhost
iptables -A INPUT -p tcp --dport 25 -s 127.0.0.1 -j ACCEPT    # SMTP
iptables -A INPUT -p tcp --dport 8080 -s 127.0.0.1 -j ACCEPT  # HTTP Interno
iptables -A INPUT -p tcp --dport 3306 -s 127.0.0.1 -j ACCEPT  # MySQL

# Bloquear acesso externo aos serviços internos
iptables -A INPUT -p tcp --dport 25 -j DROP
iptables -A INPUT -p tcp --dport 8080 -j DROP
iptables -A INPUT -p tcp --dport 3306 -j DROP

# Salvar regras do firewall
netfilter-persistent save

# ============================================================================
# 3. CONFIGURAR APLICAÇÃO WEB PRINCIPAL (PORTA 80)
# ============================================================================
echo "[3/10] Configurando aplicação web principal..."

# Criar estrutura de diretórios
mkdir -p /var/www/html/logfiles
mkdir -p /var/log/artemis

# Configurar permissões
chown -R www-data:www-data /var/www/html
chmod 755 /var/www/html/logfiles
chmod 755 /var/log/artemis

# Criar arquivo index.php (Dashboard principal)
cat > /var/www/html/index.php << 'EOF'
<?php
// index.php - Página inicial da Artemis I
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artemis I - Status Monitoring</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #4ade80;
        }
        .subtitle {
            text-align: center;
            font-size: 1.2em;
            margin-bottom: 30px;
            color: #cbd5e1;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .status-card {
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            border-radius: 10px;
            transition: transform 0.3s;
        }
        .status-card:hover {
            transform: translateY(-5px);
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .online {
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
        }
        .offline {
            background: #ef4444;
        }
        .api-docs {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
        }
        pre {
            background: #1e293b;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            color: #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Artemis I - Mission Control</h1>
        <p class="subtitle">Real-time System Monitoring & Status Dashboard</p>
        
        <div class="status-grid">
            <div class="status-card">
                <h3><span class="status-indicator online"></span>Web Server</h3>
                <p>Status: Operational</p>
                <p>Port: 80 (HTTP)</p>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator online"></span>SSH Gateway</h3>
                <p>Status: Operational</p>
                <p>Port: 22 (Secure Shell)</p>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator online"></span>RPC Service</h3>
                <p>Status: Operational</p>
                <p>Port: 111 (RPCbind)</p>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator offline"></span>Internal Services</h3>
                <p>Status: Behind Firewall</p>
                <p>Access: Restricted</p>
            </div>
        </div>
        
        <div class="api-docs">
            <h2>📡 API Documentation</h2>
            <p>Our monitoring API provides real-time system status. Use the endpoint below:</p>
            
            <h3>Endpoint: <code>/api.php</code></h3>
            <p><strong>Method:</strong> POST only</p>
            <p><strong>Parameters:</strong></p>
            <ul>
                <li><code>url</code> (required): URL to monitor/check</li>
            </ul>
            
            <h3>Example Usage:</h3>
            <pre><code>curl -X POST http://<?php echo $_SERVER['HTTP_HOST']; ?>/api.php \
  -d "url=http://example.com"</code></pre>
            
            <p><strong>Note:</strong> The API processes URLs and stores results for analysis. 
            Some internal services may be accessible via localhost.</p>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 0, 0.1); border-left: 4px solid #f59e0b;">
                <strong>⚠️ Security Notice:</strong> This system implements strict access controls.
                Unauthorized port scanning or internal network access is prohibited.
            </div>
        </div>
        
        <footer style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 0.9em;">
            <p>Artemis I Monitoring System v2.1.4 • UHC Labs Security Challenge</p>
            <p>All accesses are logged and monitored for security purposes</p>
        </footer>
    </div>
</body>
</html>
EOF

# Criar arquivo api.php VULNERÁVEL a SSRF (Coração do desafio)
cat > /var/www/html/api.php << 'EOF'
<?php
// api.php - Vulnerável a SSRF
header('Content-Type: application/json');

// ======================
// FLAG 1: HTTP Method Manipulation
// ======================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // Flag 1 entregue quando o jogador descobre o método correto
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header("X-Artemis-Flag-1: ARTEMIS{I_HTTP_Method_Master_82f4a1}");
        echo json_encode([
            "status" => false, 
            "message" => "Only POST requests are accepted",
            "hint" => "Try using curl with -X POST"
        ]);
    } else {
        echo json_encode(["status" => false, "message" => "Only POST requests are accepted"]);
    }
    exit;
}

// Se chegou aqui, método é POST
if (!isset($_POST['url'])) {
    // Ainda entrega a Flag 1 no header
    header("X-Artemis-Flag-1: ARTEMIS{I_HTTP_Method_Master_82f4a1}");
    echo json_encode([
        "status" => false, 
        "message" => "Missing URL parameter. Check headers for a reward.",
        "documentation" => "Send a POST request with parameter 'url' containing the endpoint to monitor"
    ]);
    exit;
}

$url = $_POST['url'];
$output_dir = "logfiles/";
$filename = uniqid() . ".txt";
$output_path = $output_dir . $filename;

// Log da requisição (para debug do administrador)
$log_entry = date('Y-m-d H:i:s') . " - URL: " . $url . " - IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
file_put_contents('/var/log/artemis_api.log', $log_entry, FILE_APPEND);

// Configuração do cURL (vulnerável - não restringe protocolos)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 3); // Timeout curto para port scanning
curl_setopt($ch, CURLOPT_USERAGENT, 'Artemis-I-Monitor/2.1.4');

// PERIGO: Permitir protocolos perigosos
curl_setopt($ch, CURLOPT_PROTOCOLS, 
    CURLPROTO_HTTP | CURLPROTO_HTTPS | CURLPROTO_FILE | CURLPROTO_FTP | 
    CURLPROTO_GOPHER | CURLPROTO_TELNET); // Inclui gopher!

// Ignorar verificação SSL (para testes internos)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Salvar resultado no diretório de logs
if (!is_dir($output_dir)) {
    mkdir($output_dir, 0755, true);
}

file_put_contents($output_path, "=== Artemis I Monitoring Result ===\n");
file_put_contents($output_path, "URL: " . $url . "\n", FILE_APPEND);
file_put_contents($output_path, "Time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
file_put_contents($output_path, "HTTP Code: " . $http_code . "\n", FILE_APPEND);
file_put_contents($output_path, "Content Length: " . strlen($result) . " bytes\n", FILE_APPEND);
file_put_contents($output_path, "\n=== BEGIN CONTENT ===\n", FILE_APPEND);
file_put_contents($output_path, $result, FILE_APPEND);
file_put_contents($output_path, "\n=== END CONTENT ===\n", FILE_APPEND);

// Resposta para o usuário
echo json_encode([
    "status" => true,
    "time" => "0.02s",
    "output_id" => $filename,
    "message" => "Monitoring completed. Result saved for analysis.",
    "hint" => "Results are stored in logfiles/ directory. Some internal services respond to localhost."
]);
?>
EOF

# Criar arquivo .htaccess para proteger diretório logfiles
cat > /var/www/html/logfiles/.htaccess << 'EOF'
# Proteger diretório de logs
Options -Indexes
Deny from all
<FilesMatch "\.txt$">
    Allow from all
</FilesMatch>
EOF

# ============================================================================
# 4. CONFIGURAR SERVIÇO WEB INTERNO (PORTA 8080)
# ============================================================================
echo "[4/10] Configurando serviço web interno..."

# Criar diretório para serviço interno
mkdir -p /var/www/html_internal
chown -R www-data:www-data /var/www/html_internal

# Criar configuração do Apache para porta 8080
cat > /etc/apache2/sites-available/artemis-internal.conf << 'EOF'
Listen 127.0.0.1:8080
<VirtualHost 127.0.0.1:8080>
    ServerName artemis-internal.local
    DocumentRoot /var/www/html_internal
    
    <Directory /var/www/html_internal>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        Order allow,deny
        Allow from 127.0.0.1
        Deny from all
    </Directory>
    
    # Logs separados para serviço interno
    ErrorLog /var/log/apache2/artemis-internal-error.log
    CustomLog /var/log/apache2/artemis-internal-access.log combined
    
    # Configuração para permitir PHP
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
</VirtualHost>
EOF

# Ativar site e recarregar Apache
a2ensite artemis-internal.conf
systemctl reload apache2

# ============================================================================
# 5. CRIAR CONTEÚDO DO SERVIÇO INTERNO (FLAG 2 E VULNERABILIDADES)
# ============================================================================
echo "[5/10] Criando conteúdo do serviço interno..."

# Criar index.php interno (contém FLAG 2)
cat > /var/www/html_internal/index.php << 'EOF'
<?php
// ======================
// FLAG 2: SSRF Internal Discovery
// ======================
echo "<!DOCTYPE html>";
echo "<html><head><title>Artemis I - Internal Dashboard</title>";
echo "<style>body { font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 20px; }";
echo ".flag { background: #065f46; padding: 10px; margin: 20px 0; border-radius: 5px; }</style>";
echo "</head><body>";
echo "<h1>🔐 Artemis I - Internal Management Console</h1>";
echo "<hr>";
echo "<p><strong>Warning:</strong> This interface is for internal use only.</p>";
echo "<p>Access from external networks is strictly prohibited.</p>";
echo "<br>";
echo "<div class='flag'>";
echo "<strong>FLAG 2:</strong> ARTEMIS{II_SSRF_Internal_Access_9b3c7d}";
echo "</div>";
echo "<br>";
echo "<h3>Available Services:</h3>";
echo "<ul>";
echo "<li><a href='/reader.php'>Log Reader (reader.php)</a> - View system logs</li>";
echo "<li><a href='/mail.php'>Mail Interface (mail.php)</a> - Internal mail system</li>";
echo "<li><a href='/admin/'>Admin Panel</a> - Restricted access</li>";
echo "</ul>";
echo "<br>";
echo "<div style='background: #1e293b; padding: 15px; border-radius: 5px;'>";
echo "<h4>System Status:</h4>";
echo "<p>SMTP Server: Running on port 25</p>";
echo "<p>Database: MySQL on port 3306 (root access disabled)</p>";
echo "<p>Log Rotation: Active (logs in /var/log/artemis/)</p>";
echo "</div>";
echo "</body></html>";
?>
EOF

# Criar reader.php VULNERÁVEL a LFI (para FLAG 3)
cat > /var/www/html_internal/reader.php << 'EOF'
<?php
// reader.php - Vulnerável a Local File Inclusion
error_reporting(0);

echo "<html><head><title>Artemis I - Log Reader</title>";
echo "<style>body { font-family: monospace; background: #1e293b; color: #cbd5e1; padding: 20px; }";
echo "pre { background: #0f172a; padding: 15px; border-radius: 5px; }</style>";
echo "</head><body>";
echo "<h1>📄 Artemis I - System Log Reader</h1>";
echo "<p>Internal tool for viewing system logs. Use with caution.</p>";
echo "<hr>";

if (isset($_GET['file'])) {
    $file = $_GET['file'];
    
    // ======================
    // VULNERABILIDADE: LFI sem validação adequada
    // ======================
    
    // Simulação de filtro fraco (apenas remove "../")
    $file = str_replace('../', '', $file);
    
    // Lista de arquivos permitidos (mas a implementação é falha)
    $allowed_files = [
        'system.log',
        'access.log',
        'error.log',
        'mail.log'
    ];
    
    // VULNERABILIDADE: include() sem validação adequada
    if (file_exists($file)) {
        echo "<h3>Contents of: " . htmlspecialchars($file) . "</h3>";
        echo "<pre>";
        include($file); // VULNERÁVEL a LFI!
        echo "</pre>";
        
        // Dica para Flag 3
        if (strpos($file, 'passwd') !== false) {
            echo "<div style='background: #065f46; padding: 10px; margin: 20px 0; border-radius: 5px;'>";
            echo "<strong>Hint:</strong> Check home directories for user logs...";
            echo "</div>";
        }
    } else {
        echo "<div style='color: #ef4444;'>File not found: " . htmlspecialchars($file) . "</div>";
    }
} else {
    echo "<form method='GET'>";
    echo "<label for='file'>Log file to view:</label><br>";
    echo "<input type='text' id='file' name='file' size='50' value='system.log'>";
    echo "<input type='submit' value='View Log'>";
    echo "</form>";
    
    echo "<br><h3>Available Log Files:</h3>";
    echo "<ul>";
    echo "<li><a href='?file=system.log'>system.log</a> - General system logs</li>";
    echo "<li><a href='?file=/var/log/apache2/access.log'>access.log</a> - Web server access logs</li>";
    echo "<li><a href='?file=/var/log/apache2/error.log'>error.log</a> - Web server error logs</li>";
    echo "<li><a href='?file=/var/log/auth.log'>auth.log</a> - Authentication logs</li>";
    echo "<li><a href='?file=/proc/self/environ'>Environment</a> - Process environment</li>";
    echo "</ul>";
    
    echo "<div style='background: #374151; padding: 15px; margin-top: 20px; border-radius: 5px;'>";
    echo "<h4>⚠️ Security Note:</h4>";
    echo "<p>This interface should only be accessed from localhost. File inclusion is restricted to log directories.</p>";
    echo "</div>";
}

echo "</body></html>";
?>
EOF

# Criar arquivo de exemplo de log
cat > /var/www/html_internal/system.log << 'EOF'
=== Artemis I System Log ===
Timestamp: 2024-01-15 14:30:00
System: Running normally
Services: HTTP (80), SMTP (25), MySQL (3306)
Last Backup: 2024-01-14 23:00:00
Next Maintenance: 2024-01-20 02:00:00
====================================
EOF

# ============================================================================
# 6. CONFIGURAR SMTP (POSTFIX) - PARA DEMONSTRAÇÃO GOPHER
# ============================================================================
echo "[6/10] Configurando servidor SMTP..."

# Configurar Postfix apenas para localhost
postconf -e "inet_interfaces = loopback-only"
postconf -e "inet_protocols = ipv4"
postconf -e "mydestination = localhost.localdomain, localhost"
postconf -e "myhostname = artemis.local"
postconf -e "mynetworks = 127.0.0.0/8 [::1]/128"

# Criar usuário para flag 3
useradd -m -s /bin/bash artemis_user
echo "artemis_user:ArtemisPass2024!" | chpasswd

# ======================
# FLAG 3: Local File Inclusion
# ======================
# Criar arquivo com Flag 3 no home directory
echo "ARTEMIS{III_LFI_Privilege_Escalation_d8e5f2}" > /home/artemis_user/user.txt
chmod 644 /home/artemis_user/user.txt

# Criar arquivo de log do usuário (para LFI)
cat > /home/artemis_user/system.log << 'EOF'
=== Artemis User Log ===
User: artemis_user
Last login: 2024-01-15 14:25:00
Department: Security Monitoring
Access Level: Internal
Email: artemis_user@artemis.local
Home Directory: /home/artemis_user
====================================
EOF

chmod 644 /home/artemis_user/system.log

# Reiniciar Postfix
systemctl restart postfix

# ============================================================================
# 7. CONFIGURAR MYSQL PARA ATAQUE GOPHER (OPCIONAL)
# ============================================================================
echo "[7/10] Configurando banco de dados MySQL..."

# Configurar MySQL para aceitar conexões locais
sed -i 's/bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Criar banco de dados e usuário vulnerável
mysql -e "CREATE DATABASE IF NOT EXISTS artemis_db;"
mysql -e "CREATE USER IF NOT EXISTS 'artemis_admin'@'localhost' IDENTIFIED BY 'WeakPassword123!';"
mysql -e "GRANT ALL PRIVILEGES ON artemis_db.* TO 'artemis_admin'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Criar tabela com dados sensíveis
mysql artemis_db << 'EOF'
CREATE TABLE IF NOT EXISTS sensitive_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50),
    password VARCHAR(100),
    email VARCHAR(100),
    access_level VARCHAR(20)
);

INSERT IGNORE INTO sensitive_data (username, password, email, access_level) VALUES
('admin', 'SuperSecret2024!', 'admin@artemis.local', 'root'),
('monitor', 'MonitorPass123', 'monitor@artemis.local', 'user'),
('backup', 'BackupAccess789', 'backup@artemis.local', 'backup');
EOF

# Criar arquivo com informações de conexão (dica para ataque Gopher)
cat > /var/www/html_internal/db_info.txt << 'EOF'
=== MySQL Internal Connection Info ===
Host: 127.0.0.1:3306
Database: artemis_db
User: artemis_admin
Password: WeakPassword123!

=== Protocol Support ===
Gopher protocol can be used to interact with MySQL
Example payload format:
gopher://127.0.0.1:3306/_mysql_packet_data

Note: This is for educational purposes only.
=============================================
EOF

chmod 644 /var/www/html_internal/db_info.txt

systemctl restart mysql

# ============================================================================
# 8. CONFIGURAR CAMINHO PARA FLAG 4 (RCE VIA LOG POISONING)
# ============================================================================
echo "[8/10] Configurando caminho para RCE..."

# ======================
# FLAG 4: Remote Code Execution
# ======================

# Criar flag final (root)
echo "ARTEMIS{IV_Full_System_Compromise_6a9c8b}" > /root/root.txt
chmod 600 /root/root.txt

# Configurar logs do Apache para serem legíveis (vulnerabilidade)
chmod 644 /var/log/apache2/access.log
chmod 644 /var/log/apache2/error.log

# Criar diretório de configuração da aplicação
mkdir -p /etc/artemis

# Criar arquivo de configuração vulnerável
cat > /etc/artemis/config.inc.php << 'EOF'
<?php
// Configuração vulnerável do Artemis I
// NUNCA USAR EM PRODUÇÃO!

$db_host = '127.0.0.1';
$db_user = 'artemis_admin';
$db_pass = 'WeakPassword123!';
$db_name = 'artemis_db';

// Função perigosa (para demonstração)
function executeQuery($query) {
    global $db_host, $db_user, $db_pass, $db_name;
    $conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name);
    if(!$conn) return false;
    $result = mysqli_query($conn, $query);
    mysqli_close($conn);
    return $result;
}

// DEBUG MODE - NEVER USE IN PRODUCTION
define('DEBUG', true);

// Vulnerabilidade: Log de queries (pode ser injetado)
if(isset($_GET['query'])) {
    $log_file = '/var/log/artemis/queries.log';
    $log_entry = date('Y-m-d H:i:s') . " - Query: " . $_GET['query'] . " - IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND);
}

// Info para debug
if(DEBUG && isset($_GET['debug'])) {
    phpinfo();
    exit;
}
?>
EOF

chmod 644 /etc/artemis/config.inc.php

# Criar arquivo de log de queries
touch /var/log/artemis/queries.log
chmod 666 /var/log/artemis/queries.log

# ============================================================================
# 9. CRIAR USUÁRIO CTF E CONFIGURAÇÕES FINAIS
# ============================================================================
echo "[9/10] Criando usuários e configurações finais..."

# Criar usuário para jogadores CTF
useradd -m -s /bin/bash ctf_player
echo "ctf_player:PlayCTF2024!" | chpasswd

# Adicionar usuário ao grupo www-data (para acesso a alguns logs)
usermod -a -G www-data ctf_player

# Criar alguns arquivos de log de exemplo
cat > /var/log/artemis/api_access.log << 'EOF'
2024-01-15 10:30:00 - POST /api.php - IP: 192.168.1.100 - URL: http://example.com
2024-01-15 10:31:00 - POST /api.php - IP: 192.168.1.100 - URL: file:///etc/passwd
2024-01-15 10:32:00 - POST /api.php - IP: 192.168.1.100 - URL: http://localhost:8080
2024-01-15 10:33:00 - GET /api.php - IP: 192.168.1.100 - Method not allowed
2024-01-15 10:34:00 - POST /api.php - IP: 192.168.1.100 - URL: gopher://127.0.0.1:25/_HELO
EOF

cat > /var/log/artemis/internal_access.log << 'EOF'
2024-01-15 10:35:00 - GET /reader.php - IP: 127.0.0.1
2024-01-15 10:36:00 - GET /reader.php?file=system.log - IP: 127.0.0.1
2024-01-15 10:37:00 - GET /reader.php?file=/etc/passwd - IP: 127.0.0.1
2024-01-15 10:38:00 - GET /reader.php?file=/home/artemis_user/user.txt - IP: 127.0.0.1
EOF

# Configurar permissões dos logs
chmod 755 /var/log/artemis
chmod 644 /var/log/artemis/*.log

# ============================================================================
# 10. CRIAR SCRIPT DE VERIFICAÇÃO E README
# ============================================================================
echo "[10/10] Criando scripts de verificação e documentação..."

# Criar script de verificação do sistema
cat > /usr/local/bin/check_artemis.sh << 'EOF'
#!/bin/bash
# Script de verificação da máquina Artemis I

echo "=== Verificação da Máquina Artemis I ==="
echo "Data: $(date)"
echo ""

# Verificar serviços em execução
echo "1. Serviços em execução:"
echo "   Apache (80): $(systemctl is-active apache2)"
echo "   Apache (8080): $(ss -tln | grep ':8080' > /dev/null && echo 'Ativo' || echo 'Inativo')"
echo "   MySQL: $(systemctl is-active mysql)"
echo "   Postfix: $(systemctl is-active postfix)"
echo ""

# Verificar portas abertas
echo "2. Portas abertas (externas):"
ss -tln | grep -E ':22|:80|:111' | sort
echo ""

# Verificar portas internas
echo "3. Portas internas (localhost):"
ss -tln | grep -E ':25|:8080|:3306' | sort
echo ""

# Verificar flags
echo "4. Verificação das flags:"
echo "   Flag 1: $(grep -r 'ARTEMIS{I_HTTP_Method_Master' /var/www/html/ 2>/dev/null | wc -l) arquivo(s) encontrado(s)"
echo "   Flag 2: $(grep -r 'ARTEMIS{II_SSRF_Internal_Access' /var/www/html_internal/ 2>/dev/null | wc -l) arquivo(s) encontrado(s)"
echo "   Flag 3: $(test -f /home/artemis_user/user.txt && echo 'Presente' || echo 'Ausente')"
echo "   Flag 4: $(test -f /root/root.txt && echo 'Presente' || echo 'Ausente')"
echo ""

# Verificar vulnerabilidades
echo "5. Vulnerabilidades configuradas:"
echo "   SSRF em api.php: $(grep -q 'CURLOPT_PROTOCOLS.*GOPHER' /var/www/html/api.php && echo 'SIM' || echo 'NÃO')"
echo "   LFI em reader.php: $(grep -q 'include(\$file)' /var/www/html_internal/reader.php && echo 'SIM' || echo 'NÃO')"
echo "   Logs acessíveis: $(test -r /var/log/apache2/access.log && echo 'SIM' || echo 'NÃO')"
echo ""

echo "=== Verificação concluída ==="
EOF

chmod +x /usr/local/bin/check_artemis.sh

# Criar arquivo README para administradores
cat > /root/ARTEMIS_README.md << 'EOF'
# MÁQUINA CTF: ARTEMIS I

## INFORMAÇÕES PARA ADMINISTRADORES

### CREDENCIAIS PADRÃO
- SSH (opcional): root / [senha definida na instalação]
- Usuário CTF: ctf_player / PlayCTF2024!
- Usuário vulnerável: artemis_user / ArtemisPass2024!
- MySQL: artemis_admin / WeakPassword123!

### FLAGS IMPLEMENTADAS
1. **Flag 1**: ARTEMIS{I_HTTP_Method_Master_82f4a1}
   - Local: Header X-Artemis-Flag-1 na resposta da API
   - Obtenção: Enviar requisição POST para /api.php

2. **Flag 2**: ARTEMIS{II_SSRF_Internal_Access_9b3c7d}
   - Local: /var/www/html_internal/index.php
   - Obtenção: Usar SSRF para acessar http://localhost:8080

3. **Flag 3**: ARTEMIS{III_LFI_Privilege_Escalation_d8e5f2}
   - Local: /home/artemis_user/user.txt
   - Obtenção: Explorar LFI no reader.php para ler o arquivo

4. **Flag 4**: ARTEMIS{IV_Full_System_Compromise_6a9c8b}
   - Local: /root/root.txt
   - Obtenção: RCE via log poisoning ou outro método

### VULNERABILIDADES CONFIGURADAS
1. **SSRF (Server-Side Request Forgery)**
   - Arquivo: /var/www/html/api.php
   - Permite: file://, http://, gopher://, etc.
   - Uso: Port scanning interno, leitura de arquivos

2. **LFI (Local File Inclusion)**
   - Arquivo: /var/www/html_internal/reader.php
   - Falha: Filtro fraco (apenas remove "../")
   - Uso: Leitura de arquivos do sistema

3. **Log Poisoning para RCE**
   - Arquivos: /var/log/apache2/access.log (permissão 644)
   - Técnica: Injetar código PHP nos logs e incluir via LFI

4. **Gopher Attack Vector**
   - Serviços: SMTP (25) e MySQL (3306)
   - Configuração: Protocolo gopher permitido no cURL

### COMANDOS ÚTEIS
```bash
# Verificar status do sistema
check_artemis.sh

# Reiniciar serviços
systemctl restart apache2 mysql postfix

# Ver logs em tempo real
tail -f /var/log/artemis/api_access.log
tail -f /var/log/apache2/access.log

# Testar vulnerabilidades (como jogador)
curl -X POST http://localhost/api.php -d "url=file:///etc/passwd"