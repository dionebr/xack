#!/bin/bash

# OpenVPN Server Setup Script for XACK Platform
# Run as root on the VPS

set -e

echo "🔐 Installing OpenVPN Server..."

# Install OpenVPN
apt-get update
apt-get install -y openvpn iptables-persistent

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "📡 Detected public IP: $PUBLIC_IP"

# Create server configuration
cat > /etc/openvpn/server.conf <<EOF
# XACK Platform OpenVPN Server Configuration
port 1194
proto udp
dev tun

# SSL/TLS root certificate (ca), certificate (cert), and private key (key)
ca /root/openvpn-ca/pki/ca.crt
cert /root/openvpn-ca/pki/issued/server.crt
key /root/openvpn-ca/pki/private/server.key
dh /root/openvpn-ca/pki/dh.pem
tls-auth /root/openvpn-ca/ta.key 0

# Network topology
topology subnet

# VPN subnet (clients will get IPs from this range)
server 10.8.0.0 255.255.255.0

# Maintain a record of client <-> virtual IP address associations
ifconfig-pool-persist /var/log/openvpn/ipp.txt

# Push routes to clients
push "route 10.10.0.0 255.255.0.0"

# Allow client-to-client communication
client-to-client

# Keep alive
keepalive 10 120

# Cryptographic cipher
cipher AES-256-GCM
auth SHA256

# Compression
compress lz4-v2
push "compress lz4-v2"

# Maximum clients
max-clients 100

# User/group
user nobody
group nogroup

# Persist options
persist-key
persist-tun

# Logging
status /var/log/openvpn/openvpn-status.log
log-append /var/log/openvpn/openvpn.log
verb 3
mute 20
EOF

# Create log directory
mkdir -p /var/log/openvpn

# Generate server certificate if it doesn't exist
cd /root/openvpn-ca
if [ ! -f "pki/issued/server.crt" ]; then
    echo "🔑 Generating server certificate..."
    ./easyrsa --batch build-server-full server nopass
fi

# Generate DH parameters if they don't exist
if [ ! -f "pki/dh.pem" ]; then
    echo "🔐 Generating DH parameters (this may take a while)..."
    ./easyrsa gen-dh
fi

# Enable IP forwarding
echo "🌐 Enabling IP forwarding..."
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

# Configure firewall
echo "🔥 Configuring firewall..."

# Allow OpenVPN port
iptables -A INPUT -p udp --dport 1194 -j ACCEPT

# NAT for VPN clients
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE

# Allow forwarding from VPN to machines network
iptables -A FORWARD -s 10.8.0.0/24 -d 10.10.0.0/16 -j ACCEPT
iptables -A FORWARD -d 10.8.0.0/24 -s 10.10.0.0/16 -j ACCEPT

# Save iptables rules
netfilter-persistent save

# Enable and start OpenVPN
echo "🚀 Starting OpenVPN server..."
systemctl enable openvpn@server
systemctl start openvpn@server

# Update environment variable for VPN script
echo "export XACK_PUBLIC_IP=$PUBLIC_IP" >> /etc/environment

echo "✅ OpenVPN server installed and running!"
echo "📡 Public IP: $PUBLIC_IP"
echo "🔍 Check status: systemctl status openvpn@server"
echo "📋 View logs: tail -f /var/log/openvpn/openvpn.log"
