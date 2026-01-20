#!/bin/bash
# backup_restore.sh - Script professionnel de sauvegarde/restauration MongoDB
# Usage: ./backup_restore.sh [--backup|--restore fichier]

set -e  # Arrêter en cas d'erreur

# Configuration
CONFIG_FILE="./config/database.conf"
BACKUP_DIR="./backups/database"
LOG_DIR="./logs/backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30  # Garder 30 jours de sauvegardes

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Charger configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    else
        # Valeurs par défaut
        MONGODB_URI="mongodb://localhost:27017/educours"
        BACKUP_DIR="./backups/database"
    fi
}

# Vérifier MongoDB
check_mongodb() {
    if ! command -v mongodump &> /dev/null; then
        log_error "mongodump non installé. Installez MongoDB Tools."
    fi

    if ! mongo --quiet "$MONGODB_URI" --eval "db.adminCommand('ping')" > /dev/null; then
        log_error "Impossible de se connecter à MongoDB"
    fi
}

# Sauvegarde
backup_database() {
    log_info "Démarrage de la sauvegarde..."

    # Créer dossier de sauvegarde
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR"

    local backup_file="${BACKUP_DIR}/backup_${TIMESTAMP}"
    local log_file="${LOG_DIR}/backup_${TIMESTAMP}.log"

    log_info "Sauvegarde vers: $backup_file"
    log_info "Log: $log_file"

    # Exécuter la sauvegarde
    mongodump \
        --uri="$MONGODB_URI" \
        --out="$backup_file" \
        --gzip \
        --quiet \
        2>> "$log_file"

    if [ $? -eq 0 ]; then
        # Créer archive compressée
        cd "$BACKUP_DIR"
        tar -czf "backup_${TIMESTAMP}.tar.gz" "backup_${TIMESTAMP}"
        rm -rf "backup_${TIMESTAMP}"
        cd - > /dev/null

        local backup_size=$(du -h "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" | cut -f1)
        log_success "Sauvegarde réussie! Taille: $backup_size"

        # Nettoyer vieilles sauvegardes
        cleanup_old_backups
    else
        log_error "Échec de la sauvegarde. Voir $log_file"
    fi
}

# Restauration
restore_database() {
    local backup_file="$1"

    if [ -z "$backup_file" ]; then
        log_error "Spécifiez un fichier de sauvegarde"
    fi

    if [ ! -f "$backup_file" ]; then
        log_error "Fichier non trouvé: $backup_file"
    fi

    log_warning "ATTENTION: Vous allez RESTAURER la base de données."
    log_warning "Cela ÉCRASERA les données actuelles!"
    echo ""
    read -p "Êtes-vous sûr? (tapez 'OUI' pour continuer): " confirmation

    if [ "$confirmation" != "OUI" ]; then
        log_info "Restauration annulée"
        exit 0
    fi

    log_info "Restauration depuis: $backup_file"

    # Extraire l'archive si besoin
    local extract_dir=$(mktemp -d)

    if [[ "$backup_file" == *.tar.gz ]]; then
        log_info "Extraction de l'archive..."
        tar -xzf "$backup_file" -C "$extract_dir"
        local backup_path="$extract_dir/$(basename "$backup_file" .tar.gz)"
    else
        backup_path="$backup_file"
    fi

    # Restaurer
    mongorestore \
        --uri="$MONGODB_URI" \
        --drop \
        --gzip \
        --dir="$backup_path"

    if [ $? -eq 0 ]; then
        log_success "Restauration réussie!"

        # Nettoyer
        if [ -d "$extract_dir" ]; then
            rm -rf "$extract_dir"
        fi
    else
        log_error "Échec de la restauration"
    fi
}

# Nettoyer vieilles sauvegardes
cleanup_old_backups() {
    log_info "Nettoyage des sauvegardes de plus de $RETENTION_DAYS jours..."

    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$LOG_DIR" -name "*.log" -mtime +$RETENTION_DAYS -delete

    log_success "Nettoyage terminé"
}

# Lister sauvegardes
list_backups() {
    log_info "Sauvegardes disponibles:"

    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $6 " " $7 " " $8 " - " $9}' || log_info "  Aucune sauvegarde"
    else
        log_info "  Dossier de sauvegarde vide"
    fi
}

# Vérifier intégrité
verify_backup() {
    local backup_file="$1"

    log_info "Vérification de l'intégrité: $backup_file"

    # Vérifier archive
    if ! tar -tzf "$backup_file" > /dev/null 2>&1; then
        log_error "Archive corrompue: $backup_file"
    fi

    log_success "Backup vérifié et valide"
}

# Point d'entrée principal
main() {
    load_config
    check_mongodb

    case "$1" in
        --backup|-b)
            backup_database
            ;;
        --restore|-r)
            restore_database "$2"
            ;;
        --list|-l)
            list_backups
            ;;
        --verify|-v)
            verify_backup "$2"
            ;;
        --cleanup|-c)
            cleanup_old_backups
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Usage: $0 [--backup|--restore file|--list|--verify file|--cleanup|--help]"
            ;;
    esac
}

# Afficher aide
show_help() {
    cat << EOF
Script de sauvegarde/restauration MongoDB - EduCours Platform

Usage:
  $0 --backup          Sauvegarder la base de données
  $0 --restore FILE    Restaurer depuis un fichier
  $0 --list            Lister les sauvegardes disponibles
  $0 --verify FILE     Vérifier l'intégrité d'une sauvegarde
  $0 --cleanup         Nettoyer les vieilles sauvegardes
  $0 --help            Afficher cette aide

Exemples:
  ./backup_restore.sh --backup
  ./backup_restore.sh --restore backups/database/backup_20240115.tar.gz
  ./backup_restore.sh --list

Configuration:
  Éditez le fichier: $CONFIG_FILE
EOF
}

# Démarrer
main "$@"