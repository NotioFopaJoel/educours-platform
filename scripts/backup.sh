#!/bin/bash
# backup.sh - Script de sauvegarde robuste avec rotation et chiffrement
# Usage: ./backup.sh [--full|--incremental] [--encrypt]

set -euo pipefail

# Configuration
CONFIG_FILE="./config/backup.conf"
LOG_DIR="./logs/backup"
BACKUP_DIR="/var/backups/educours"
ENCRYPT=false
BACKUP_TYPE="full"
RETENTION_DAYS=30
COMPRESSION_LEVEL=6
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/backup_${TIMESTAMP}.log"

# Charger la configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    else
        # Configuration par défaut
        DB_HOST="localhost"
        DB_PORT="27017"
        DB_NAME="educours"
        DB_USER="educours"
        UPLOADS_DIR="./backend/uploads"
        BACKUP_DIR="/var/backups/educours"
        RETENTION_DAYS=30
        ENCRYPTION_KEY_FILE="./config/backup.key"
        S3_BUCKET="educours-backups"
        S3_PATH="backups/"
    fi
}

# Initialisation
init() {
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
    
    echo "=== SAUVEGARDE EDUCOURS ==="
    echo "Date: $(date)"
    echo "Type: $BACKUP_TYPE"
    echo "Chiffrement: $ENCRYPT"
    echo "Log: $LOG_FILE"
    echo ""
}

# Sauvegarde de la base de données
backup_database() {
    echo "📊 Sauvegarde de la base de données..."
    
    local db_backup="${BACKUP_DIR}/db_${TIMESTAMP}.gz"
    
    # MongoDB
    if command -v mongodump &> /dev/null; then
        echo "  MongoDB..."
        mongodump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --db="$DB_NAME" \
            --username="$DB_USER" \
            --password="$DB_PASSWORD" \
            --gzip \
            --archive="$db_backup" \
            --quiet
        
        if [ $? -eq 0 ]; then
            echo "  ✓ MongoDB sauvegardé: $(du -h "$db_backup" | cut -f1)"
            echo "$db_backup" >> "${BACKUP_DIR}/db_files.txt"
        else
            echo "  ✗ Échec de la sauvegarde MongoDB"
            return 1
        fi
    fi
    
    # PostgreSQL (si utilisé)
    if command -v pg_dump &> /dev/null && [ -n "$PG_DATABASE" ]; then
        echo "  PostgreSQL..."
        local pg_backup="${BACKUP_DIR}/pg_${TIMESTAMP}.sql.gz"
        
        PGPASSWORD="$PG_PASSWORD" pg_dump \
            -h "$PG_HOST" \
            -U "$PG_USER" \
            -d "$PG_DATABASE" \
            --clean \
            | gzip -c > "$pg_backup"
        
        if [ $? -eq 0 ]; then
            echo "  ✓ PostgreSQL sauvegardé: $(du -h "$pg_backup" | cut -f1)"
            echo "$pg_backup" >> "${BACKUP_DIR}/db_files.txt"
        else
            echo "  ✗ Échec de la sauvegarde PostgreSQL"
        fi
    fi
    
    echo "✅ Base de données sauvegardée"
}

# Sauvegarde des fichiers
backup_files() {
    echo "📁 Sauvegarde des fichiers..."
    
    local files_backup="${BACKUP_DIR}/files_${TIMESTAMP}.tar.gz"
    
    # Créer une liste des fichiers à sauvegarder
    cat > /tmp/backup_list.txt << EOF
./backend/uploads
./backend/.env
./frontend/.env.local
./docker-compose.yml
./nginx/ssl
./config
EOF
    
    # Sauvegarder avec tar
    tar -czf "$files_backup" \
        --files-from=/tmp/backup_list.txt \
        --exclude="node_modules" \
        --exclude="*.log" \
        --exclude="*.tmp" \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Fichiers sauvegardés: $(du -h "$files_backup" | cut -f1)"
        echo "$files_backup" >> "${BACKUP_DIR}/file_backups.txt"
    else
        echo "  ✗ Échec de la sauvegarde des fichiers"
        return 1
    fi
    
    rm -f /tmp/backup_list.txt
    echo "✅ Fichiers sauvegardés"
}

# Sauvegarde incrémentale
backup_incremental() {
    echo "🔄 Sauvegarde incrémentale..."
    
    local snapshot_file="${BACKUP_DIR}/last_snapshot.snar"
    local inc_backup="${BACKUP_DIR}/inc_${TIMESTAMP}.tar.gz"
    
    if [ ! -f "$snapshot_file" ]; then
        echo "  Première sauvegarde incrémentale, création du snapshot..."
        tar -czf "$inc_backup" \
            --listed-incremental="$snapshot_file" \
            -C / \
            ./opt/educours \
            ./etc/educours
    else
        echo "  Sauvegarde incrémentale depuis le dernier snapshot..."
        tar -czf "$inc_backup" \
            --listed-incremental="$snapshot_file" \
            -C / \
            ./opt/educours \
            ./etc/educours
    fi
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Sauvegarde incrémentale: $(du -h "$inc_backup" | cut -f1)"
    else
        echo "  ✗ Échec de la sauvegarde incrémentale"
    fi
}

# Chiffrement
encrypt_backup() {
    if [ "$ENCRYPT" = true ] && [ -f "$ENCRYPTION_KEY_FILE" ]; then
        echo "🔒 Chiffrement des sauvegardes..."
        
        for backup_file in "${BACKUP_DIR}"/*_${TIMESTAMP}.*; do
            if [ -f "$backup_file" ]; then
                local encrypted_file="${backup_file}.enc"
                
                openssl enc -aes-256-cbc \
                    -salt \
                    -in "$backup_file" \
                    -out "$encrypted_file" \
                    -pass file:"$ENCRYPTION_KEY_FILE"
                
                if [ $? -eq 0 ]; then
                    rm -f "$backup_file"
                    echo "  ✓ $(basename "$backup_file") chiffré"
                fi
            fi
        done
        
        echo "✅ Chiffrement terminé"
    fi
}

# Synchronisation S3
sync_s3() {
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        echo "☁️  Synchronisation avec S3..."
        
        aws s3 sync \
            "$BACKUP_DIR/" \
            "s3://${S3_BUCKET}/${S3_PATH}" \
            --exclude "*" \
            --include "*${TIMESTAMP}*" \
            --storage-class STANDARD_IA \
            --quiet
        
        if [ $? -eq 0 ]; then
            echo "✅ Synchronisation S3 terminée"
        else
            echo "⚠️  Échec de la synchronisation S3"
        fi
    fi
}

# Rotation des sauvegardes
rotate_backups() {
    echo "🗑️  Rotation des sauvegardes..."
    
    # Supprimer les vieilles sauvegardes locales
    find "$BACKUP_DIR" -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type f -name "*.enc" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type f -name "*.log" -mtime +30 -delete
    
    # Nettoyer S3
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
        
        aws s3 ls "s3://${S3_BUCKET}/${S3_PATH}" | while read -r line; do
            local date_part=$(echo "$line" | awk '{print $1}' | tr -d '-')
            local filename=$(echo "$line" | awk '{print $4}')
            
            if [[ "$date_part" < "$cutoff_date" ]]; then
                aws s3 rm "s3://${S3_BUCKET}/${S3_PATH}${filename}" --quiet
            fi
        done
    fi
    
    echo "✅ Rotation terminée"
}

# Vérification d'intégrité
verify_backup() {
    echo "🔍 Vérification de l'intégrité..."
    
    local all_ok=true
    
    for backup_file in "${BACKUP_DIR}"/*_${TIMESTAMP}.*; do
        if [ -f "$backup_file" ]; then
            # Vérifier la compression
            if [[ "$backup_file" == *.gz ]]; then
                if ! gzip -t "$backup_file" 2>/dev/null; then
                    echo "  ✗ $(basename "$backup_file") corrompu"
                    all_ok=false
                fi
            fi
            
            # Vérifier le chiffrement
            if [[ "$backup_file" == *.enc ]] && [ -f "$ENCRYPTION_KEY_FILE" ]; then
                if ! openssl enc -d -aes-256-cbc \
                    -in "$backup_file" \
                    -pass file:"$ENCRYPTION_KEY_FILE" \
                    -out /dev/null 2>/dev/null; then
                    echo "  ✗ $(basename "$backup_file") chiffrement invalide"
                    all_ok=false
                fi
            fi
        fi
    done
    
    if [ "$all_ok" = true ]; then
        echo "✅ Toutes les sauvegardes sont valides"
        return 0
    else
        echo "⚠️  Certaines sauvegardes sont corrompues"
        return 1
    fi
}

# Génération de rapport
generate_report() {
    echo "📄 Génération du rapport..."
    
    local report_file="${BACKUP_DIR}/report_${TIMESTAMP}.txt"
    
    {
        echo "=== RAPPORT DE SAUVEGARDE ==="
        echo "Date: $(date)"
        echo "Type: $BACKUP_TYPE"
        echo "Durée: $SECONDS secondes"
        echo ""
        echo "=== SAUVEGARDES CRÉÉES ==="
        ls -lh "${BACKUP_DIR}"/*_${TIMESTAMP}.* 2>/dev/null || echo "Aucune"
        echo ""
        echo "=== ESPACE DISPONIBLE ==="
        df -h "$BACKUP_DIR"
        echo ""
        echo "=== STATISTIQUES ==="
        echo "Taille totale: $(du -sh "$BACKUP_DIR" | cut -f1)"
        echo "Nombre de fichiers: $(find "$BACKUP_DIR" -type f -name "*_${TIMESTAMP}.*" | wc -l)"
        echo ""
        echo "=== LOGS D'ERREUR ==="
        grep -i "error\|failed\|✗" "$LOG_FILE" | tail -5 || echo "Aucune erreur"
    } > "$report_file"
    
    echo "✅ Rapport généré: $report_file"
}

# Notification
send_notification() {
    local status="$1"
    local message="$2"
    
    echo "📧 Envoi de notification..."
    
    # Slack
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔔 Sauvegarde $status: $message\"}" \
            "$SLACK_WEBHOOK" > /dev/null || true
    fi
    
    # Email
    if [ -n "$EMAIL_TO" ] && [ -f "./backend/src/utils/mailer.js" ]; then
        node -e "
            const mailer = require('./backend/src/utils/mailer.js');
            mailer.send({
                to: '$EMAIL_TO',
                subject: 'Sauvegarde $status - $(date)',
                text: '$message'
            });
        " 2>/dev/null || true
    fi
    
    echo "✅ Notification envoyée"
}

# Point d'entrée principal
main() {
    load_config
    init
    
    local start_time=$(date +%s)
    
    # Exécuter les sauvegardes
    case $BACKUP_TYPE in
        full)
            backup_database
            backup_files
            ;;
        incremental)
            backup_incremental
            ;;
        database)
            backup_database
            ;;
        files)
            backup_files
            ;;
    esac
    
    encrypt_backup
    verify_backup
    sync_s3
    rotate_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    generate_report
    
    # Résumé
    echo ""
    echo "=== RÉSUMÉ ==="
    echo "Durée totale: ${duration}s"
    echo "Sauvegardes créées:"
    ls -lh "${BACKUP_DIR}"/*_${TIMESTAMP}.* 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' || echo "  Aucune"
    echo ""
    echo "✅ Sauvegarde terminée avec succès"
    
    # Notification de succès
    send_notification "SUCCÈS" "Sauvegarde $BACKUP_TYPE terminée en ${duration}s"
    
    exit 0
}

# Gestion des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --full)
            BACKUP_TYPE="full"
            shift
            ;;
        --incremental)
            BACKUP_TYPE="incremental"
            shift
            ;;
        --database)
            BACKUP_TYPE="database"
            shift
            ;;
        --files)
            BACKUP_TYPE="files"
            shift
            ;;
        --encrypt)
            ENCRYPT=true
            shift
            ;;
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--full|--incremental|--database|--files] [--encrypt] [--config file]"
            exit 1
            ;;
    esac
done

# Exécuter
main