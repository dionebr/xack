#!/bin/bash

# Xack VPS Deployment Script
# Automates: System Update, Firewall, OpenVPN, Docker, Node.js, Nginx

set -e

echo "Starting Xack Deployment..."

# 1. System Update
echo "Updating system..."
apt update && apt upgrade -y
apt install -y curl git unzip ufw net-tools

# 2. Firewall Setup
echo "Configuring Firewall..."
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw allow 1194/udp
# We don't enable ufw here to avoid locking ourselves out if SSH config is weird, 
# but user requested it. Let's enable it safely.
ufw --force enable

# 3. OpenVPN Setup
echo "Installing OpenVPN & Easy-RSA..."
apt install -y openvpn easy-rsa

# PKI Setup
echo "Configuring PKI..."
make-cadir ~/openvpn-ca
cd ~/openvpn-ca

./easyrsa init-pki
# Non-interactive CA build
export EASYRSA_BATCH=1
export EASYRSA_REQ_CN="XackCA"
./easyrsa build-ca nopass

# Server Cert
./easyrsa gen-req server nopass
# Sign request (needs 'yes' input)
echo "yes" | ./easyrsa sign-req server server

# DH and MAC
./easyrsa gen-dh
openvpn --genkey --secret ta.key

# Copy Certs
cp pki/ca.crt pki/private/server.key pki/issued/server.crt pki/dh.pem ta.key /etc/openvpn/

# Server Config
echo "Writing /etc/openvpn/server.conf..."
cat > /etc/openvpn/server.conf <<EOF
port 1194
proto udp
dev tun

ca ca.crt
cert server.crt
key server.key
dh dh.pem

server 10.8.0.0 255.255.255.0
push "route 10.10.0.0 255.255.0.0"

keepalive 10 120
persist-key
persist-tun

user nobody
group nogroup

tls-auth ta.key 0
cipher AES-256-GCM
verb 3
EOF

# Enable Forwarding
sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
sysctl -p

# Start OpenVPN
systemctl enable openvpn@server
systemctl start openvpn@server

# 4. Docker Setup
echo "Installing Docker..."
apt install -y docker.io
systemctl enable docker --now

# Create Network
echo "Creating Docker Network..."
docker network create --subnet=10.10.0.0/16 xack-labs-net || true

# NAT Rules
echo "Configuring NAT via UFW..."
# Allow forwarding in UFW
sed -i 's/DEFAULT_FORWARD_POLICY="DROP"/DEFAULT_FORWARD_POLICY="ACCEPT"/' /etc/default/ufw

# Add NAT rules to /etc/ufw/before.rules
# We strictly append this to the top of the file ideally, but appending to end works if *nat block is valid.
# Ideally we prepend. Let's try appending a block which is standard for UFW overrides.
if ! grep -q "*nat" /etc/ufw/before.rules; then
  # Prepend NAT rules (easier to just append for *nat table as it doesn't usually exist in default before.rules)
  cat >> /etc/ufw/before.rules <<EOF

# NAT rules for Xack
*nat
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING -s 10.8.0.0/24 -d 10.10.0.0/16 -j MASQUERADE
COMMIT
EOF
fi

ufw reload

# 5. Node.js & Nginx Setup
echo "Installing Node.js & Nginx..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx

# Nginx Config for Xack
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/xack <<EOF
server {
  listen 80 default_server;
  server_name _;

  root /opt/xack/dist;
  index index.html;

  location / {
    try_files \$uri /index.html;
  }
}
EOF

# Enable Site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/xack /etc/nginx/sites-enabled/
systemctl restart nginx

echo "Deployment Script Completed Successfully!"
echo "Next steps: copy project files to /opt/xack and build."
