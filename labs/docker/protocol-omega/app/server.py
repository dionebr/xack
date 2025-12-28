import socket
import os
import base64

HOST = '0.0.0.0'
PORT = 8888
FLAG = os.environ.get('FLAG', 'xack{local_test_flag}')

def handle_client(conn):
    conn.sendall(b"Welcome to Omega Private Terminal v0.9\n")
    conn.sendall(b"Auth required.\n")
    
    # Simple "protocol": just dump the flag encoded as a challenge
    encoded_flag = base64.b64encode(FLAG.encode()).decode()
    msg = f"DEBUG: {encoded_flag}\n"
    
    conn.sendall(msg.encode())
    conn.close()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    print(f"Listening on {HOST}:{PORT}")
    while True:
        conn, addr = s.accept()
        print(f"Connected by {addr}")
        handle_client(conn)
