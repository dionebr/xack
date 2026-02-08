FROM ubuntu:22.04

# Evitar prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependências
RUN apt-get update && apt-get install -y \
    apache2 \
    php8.1 \
    php8.1-mysql \
    php8.1-curl \
    libapache2-mod-php8.1 \
    mysql-server \
    postfix \
    mailutils \
    iptables \
    net-tools \
    curl \
    vim \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Configurar Apache
RUN a2enmod rewrite php8.1
RUN echo "ServerName artemis-i" >> /etc/apache2/apache2.conf

# Criar usuários do sistema
RUN useradd -m -s /bin/bash artemis && \
    echo "artemis:artemis123" | chpasswd && \
    useradd -m -s /bin/bash admin && \
    echo "admin:admin@uhc2024" | chpasswd

# Copiar aplicação web
COPY app/public/ /var/www/html/
COPY app/admin/ /var/www/admin/
COPY config/admin-vhost.conf /etc/apache2/sites-available/admin.conf

# Copiar scripts de inicialização
COPY config/init-db.sql /tmp/init-db.sql
COPY config/startup.sh /usr/local/bin/startup.sh
COPY config/flags.txt /root/flags.txt

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html /var/www/admin
RUN chmod +x /usr/local/bin/startup.sh
RUN chmod 600 /root/flags.txt

# Configurar site admin (porta 8080, apenas localhost)
RUN a2ensite admin.conf

# Expor portas
EXPOSE 80 111

# Script de inicialização
CMD ["/usr/local/bin/startup.sh"]
