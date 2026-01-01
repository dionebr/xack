FROM tomcat:8.5-jdk11-openjdk

# Evita prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Configurações personalizadas
ENV CTF_USER=alex
ENV TOMCAT_PORT=9090
ENV TOMCAT_USER=webadmin
ENV TOMCAT_PASS=C0mpl3xP@ss!

# Atualizar e instalar dependências
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    cron \
    net-tools \
    iputils-ping \
    vim \
    less \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário CTF
RUN useradd -m -s /bin/bash $CTF_USER && \
    echo "$CTF_USER:Password123!" | chpasswd

# Configurar porta do Tomcat (Tomcat está em /usr/local/tomcat)
RUN sed -i 's/port="8080"/port="9090"/g' /usr/local/tomcat/conf/server.xml

# Restaurar webapps padrão (Manager App, ROOT, etc) - Copiar diretamente
RUN rm -rf /usr/local/tomcat/webapps/* && \
    cp -r /usr/local/tomcat/webapps.dist/* /usr/local/tomcat/webapps/

# Copiar e configurar arquivos do Tomcat
COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
RUN sed -i "s/WEBADMIN_USER/$TOMCAT_USER/g" /usr/local/tomcat/conf/tomcat-users.xml && \
    sed -i "s/WEBADMIN_PASS/$TOMCAT_PASS/g" /usr/local/tomcat/conf/tomcat-users.xml

# PEGADINHA: Criar arquivo de credenciais falsas
RUN echo "tomcat:tomcat" > /usr/local/tomcat/conf/credentials.txt && \
    echo "admin:admin" >> /usr/local/tomcat/conf/credentials.txt && \
    chmod 644 /usr/local/tomcat/conf/credentials.txt

# Configurar diretórios do usuário CTF
RUN mkdir -p /home/$CTF_USER/scripts \
    /home/$CTF_USER/.hidden/.config \
    /home/$CTF_USER/backups

# Copiar scripts
COPY backup_task.sh /home/$CTF_USER/scripts/
RUN chmod 777 /home/$CTF_USER/scripts/backup_task.sh

# PEGADINHA: Script falso
RUN echo '#!/bin/bash\necho "Script de sistema - não modificar"\necho "$(date) - Sistema operacional" >> /home/'$CTF_USER'/system.log' > /home/$CTF_USER/scripts/system_monitor.sh && \
    chmod 755 /home/$CTF_USER/scripts/system_monitor.sh

# Configurar cron job
RUN echo "*/2 * * * * root /home/$CTF_USER/scripts/backup_task.sh" >> /etc/crontab

# Flags falsas
RUN echo "xack{Fake_Flag_Keep_Searching}" > /home/$CTF_USER/user.txt && \
    chmod 644 /home/$CTF_USER/user.txt && \
    echo "xack{Almost_There_But_Not_Quite}" > /root/system.flag && \
    chmod 644 /root/system.flag

# Flags reais
RUN echo "xack{Us3r_Fl4g_R3al_0n3_H3r3}" > /home/$CTF_USER/.hidden/.config/user.flag && \
    chmod 600 /home/$CTF_USER/.hidden/.config/user.flag && \
    echo "xack{R00t_4cc3ss_Gr4nt3d_Succ3ss}" > /root/root.flag && \
    chmod 600 /root/root.flag

# Configurar permissões
RUN chmod 700 /home/$CTF_USER/.hidden && \
    chown -R $CTF_USER:$CTF_USER /home/$CTF_USER

# Arquivos de distração
RUN echo "Logs do sistema - não perturbe" > /var/log/ctf.log && \
    echo "Backup configurado para executar periodicamente" > /home/$CTF_USER/backups/README

# Expor portas
EXPOSE 9090 8080

# Script de inicialização
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /root
ENTRYPOINT ["/entrypoint.sh"]
