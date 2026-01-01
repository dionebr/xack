#!/bin/bash

# Script de backup automático - SÉTIMA PEGADINHA: Nome inofensivo
# Executado como root a cada 2 minutos

LOGFILE="/home/alex/backups/backup.log"
BACKUP_DIR="/home/alex/backups/"

# Registrar execução
echo "$(date) - Iniciando backup do sistema" >> "$LOGFILE"

# Coletar informações do sistema (inofensivo)
whoami > /tmp/current_user.tmp 2>/dev/null
date >> /tmp/current_user.tmp 2>/dev/null

# PEGADINHA: O script parece fazer backup, mas não faz nada crítico
if [ -d "$BACKUP_DIR" ]; then
    echo "$(date) - Diretório de backup encontrado" >> "$LOGFILE"
    # Apenas lista arquivos, não copia
    ls -la /home/alex/ > "$BACKUP_DIR/filelist_$(date +%Y%m%d_%H%M%S).txt" 2>/dev/null
else
    echo "$(date) - ERRO: Diretório de backup não existe" >> "$LOGFILE"
fi

echo "$(date) - Backup concluído" >> "$LOGFILE"

# OITAVA PEGADINHA: Mensagem enganosa sobre privilégios
echo "Script executado com privilégios mínimos" >> "$LOGFILE"
