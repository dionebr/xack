#!/bin/bash

# generate-vpn.sh
# Usage: ./generate-vpn.sh <user_id>

USER_ID=$1
if [ -z "$USER_ID" ]; then
    echo "Usage: $0 <user_id>"
    exit 1
fi

# Directory where EasyRSA is initialized
CA_DIR="/root/openvpn-ca"
if [ ! -d "$CA_DIR" ]; then
    echo "Error: CA directory not found at $CA_DIR"
    exit 1
fi

cd "$CA_DIR" || exit 1

CLIENT_NAME="user-$USER_ID"

# Generate client certificate if it doesn't exist (using --batch to avoid prompts)
if [ ! -f "pki/issued/$CLIENT_NAME.crt" ]; then
    ./easyrsa --batch build-client-full "$CLIENT_NAME" nopass > /dev/null 2>&1
fi

# Read needed files
CA_CERT=$(cat pki/ca.crt)
# Extract just the certificate part
CLIENT_CERT=$(sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/p' < "pki/issued/$CLIENT_NAME.crt")
CLIENT_KEY=$(cat "pki/private/$CLIENT_NAME.key")
TLS_AUTH=$(cat ta.key)

# Get server IP - try environment variable first, then detect public IP
if [ -n "$XACK_PUBLIC_IP" ]; then
    SERVER_IP="$XACK_PUBLIC_IP"
else
    SERVER_IP=$(curl -s ifconfig.me || echo "REPLACE_WITH_SERVER_IP")
fi

# Generate OpenVPN configuration content
cat <<EOF
client
dev tun
proto udp
remote $SERVER_IP 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
compress lz4-v2
verb 3

<ca>
$CA_CERT
</ca>
<cert>
$CLIENT_CERT
</cert>
<key>
$CLIENT_KEY
</key>
<tls-auth>
$TLS_AUTH
</tls-auth>
key-direction 1
EOF
