#!/bin/bash

# Carregar variáveis de ambiente
source ../.env

# Configurar diretório de backup
BACKUP_DIR="/backups/pacs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pacs_backup_$TIMESTAMP.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Realizar backup
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -p $DB_PORT $DB_NAME > $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

# Manter apenas os últimos 7 dias de backup
find $BACKUP_DIR -name "pacs_backup_*.sql.gz" -mtime +7 -delete

# Registrar log
echo "Backup realizado em: $(date)" >> "$BACKUP_DIR/backup.log" 