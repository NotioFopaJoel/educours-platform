#!/bin/bash
# deploy.sh - Script de déploiement professionnel avec rollback
# Usage: ./deploy.sh [environment] [version]

set -e

# Configuration
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT="${1:-staging}"
VERSION="${2:-$(date +%Y%m%d_%H%M%S)}"
DEPLOY_DIR="/opt/educours"
BACKUP_DIR="/opt/backups/educours"
LOG_FILE="/var/log/educours/deploy_${VERSION}.log"

# Initialisation
init() {
    echo -e "${BLUE}[INIT] Démarrage du déploiement v${VERSION} sur ${ENVIRONMENT}${NC}"
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Charger la configuration
    if [ -f "./deploy/${ENVIRONMENT}.conf" ]; then
        source "./deploy/${ENVIRONMENT}.conf"
    else
        echo -e "${RED}[ERREUR] Configuration ${ENVIRONMENT}.conf introuvable${NC}"
        exit 1
    fi
    
    # Vérifier les variables requises
    local required_vars=("SSH_HOST" "SSH_USER" "APP_DIR")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}[ERREUR] Variable $var non définie${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}[OK] Configuration chargée${NC}"
}

# Sauvegarde
backup() {
    echo -e "${BLUE}[BACKUP] Sauvegarde en cours...${NC}"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/backup_${timestamp}.tar.gz"
    
    ssh ${SSH_USER}@${SSH_HOST} << EOF
        set -e
        cd ${APP_DIR}
        
        # Sauvegarder la base de données
        if [ -f "backend/scripts/backup.js" ]; then
            cd backend
            node scripts/backup.js --env=${ENVIRONMENT}
            cd ..
        fi
        
        # Créer une archive de l'application
        tar -czf /tmp/app_backup.tar.gz \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=uploads \
            .
        
        # Sauvegarder les uploads
        if [ -d "backend/uploads" ]; then
            tar -czf /tmp/uploads_backup.tar.gz backend/uploads/
        fi
EOF
    
    # Récupérer les sauvegardes
    scp ${SSH_USER}@${SSH_HOST}:/tmp/*_backup.tar.gz "$BACKUP_DIR/" || true
    
    echo -e "${GREEN}[OK] Sauvegarde terminée: ${backup_file}${NC}"
}

# Préparation de la version
prepare() {
    echo -e "${BLUE}[PREPARE] Préparation de la version ${VERSION}...${NC}"
    
    # Créer un tag Git
    git tag "deploy/${ENVIRONMENT}/${VERSION}"
    git push origin "deploy/${ENVIRONMENT}/${VERSION}"
    
    # Build des assets
    echo "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    echo "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Créer l'archive de déploiement
    tar -czf "/tmp/educours_${VERSION}.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=*.log \
        .
    
    echo -e "${GREEN}[OK] Version préparée${NC}"
}

# Déploiement
deploy() {
    echo -e "${BLUE}[DEPLOY] Déploiement sur ${SSH_HOST}...${NC}"
    
    # Copier l'archive
    scp "/tmp/educours_${VERSION}.tar.gz" ${SSH_USER}@${SSH_HOST}:/tmp/
    
    # Exécuter le déploiement distant
    ssh ${SSH_USER}@${SSH_HOST} << EOF
        set -e
        
        echo "Arrêt des services..."
        sudo systemctl stop educours-backend || true
        sudo systemctl stop educours-frontend || true
        
        echo "Sauvegarde de l'ancienne version..."
        if [ -d "${APP_DIR}" ]; then
            mv "${APP_DIR}" "${APP_DIR}_old_${VERSION}"
        fi
        
        echo "Extraction de la nouvelle version..."
        mkdir -p "${APP_DIR}"
        tar -xzf "/tmp/educours_${VERSION}.tar.gz" -C "${APP_DIR}"
        
        echo "Installation des dépendances..."
        cd "${APP_DIR}/backend"
        npm ci --only=production
        
        cd "${APP_DIR}/frontend"
        npm ci --only=production
        
        echo "Configuration..."
        cd "${APP_DIR}"
        
        # Restaurer les fichiers de configuration
        if [ -d "${APP_DIR}_old_${VERSION}" ]; then
            cp "${APP_DIR}_old_${VERSION}/backend/.env" "${APP_DIR}/backend/" || true
            cp "${APP_DIR}_old_${VERSION}/frontend/.env.local" "${APP_DIR}/frontend/" || true
            cp -r "${APP_DIR}_old_${VERSION}/backend/uploads" "${APP_DIR}/backend/" || true
        fi
        
        # Appliquer les migrations
        if [ -f "backend/scripts/migrate.js" ]; then
            cd backend
            node scripts/migrate.js --env=${ENVIRONMENT}
            cd ..
        fi
        
        # Permissions
        chmod -R 755 backend/uploads
        chown -R educours:educours "${APP_DIR}"
        
        echo "Démarrage des services..."
        sudo systemctl start educours-backend
        sudo systemctl start educours-frontend
        
        echo "Nettoyage..."
        rm -f "/tmp/educours_${VERSION}.tar.gz"
        
        # Garder seulement les 5 dernières sauvegardes
        ls -dt ${APP_DIR}_old_* | tail -n +6 | xargs rm -rf || true
EOF
    
    echo -e "${GREEN}[OK] Déploiement terminé${NC}"
}

# Vérification
verify() {
    echo -e "${BLUE}[VERIFY] Vérification du déploiement...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Tentative $attempt/$max_attempts..."
        
        # Vérifier la santé de l'application
        local health_status=$(ssh ${SSH_USER}@${SSH_HOST} \
            "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || echo '000'")
        
        if [ "$health_status" = "200" ]; then
            echo -e "${GREEN}[OK] Application en bonne santé${NC}"
            
            # Vérifications supplémentaires
            ssh ${SSH_USER}@${SSH_HOST} << 'EOF'
                echo "=== VÉRIFICATIONS ==="
                
                # Services
                echo "Services:"
                sudo systemctl status educours-backend --no-pager | grep -E "(Active|Status)"
                sudo systemctl status educours-frontend --no-pager | grep -E "(Active|Status)"
                
                # Ressources
                echo -e "\nRessources:"
                ps aux | grep -E "(node|nginx)" | grep -v grep | head -5
                
                # Logs récents
                echo -e "\nLogs récents:"
                sudo journalctl -u educours-backend -n 5 --no-pager | tail -5
                
                # Espace disque
                echo -e "\nEspace disque:"
                df -h ${APP_DIR} | tail -1
EOF
            
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}[ERREUR] Échec de la vérification après $max_attempts tentatives${NC}"
    return 1
}

# Rollback
rollback() {
    echo -e "${YELLOW}[ROLLBACK] Retour à la version précédente...${NC}"
    
    ssh ${SSH_USER}@${SSH_HOST} << EOF
        set -e
        
        echo "Arrêt des services..."
        sudo systemctl stop educours-backend
        sudo systemctl stop educours-frontend
        
        # Trouver la dernière sauvegarde
        local last_backup=\$(ls -dt ${APP_DIR}_old_* 2>/dev/null | head -1)
        
        if [ -z "\$last_backup" ]; then
            echo "Aucune sauvegarde disponible"
            exit 1
        fi
        
        echo "Restauration depuis: \$last_backup"
        
        # Supprimer la version défectueuse
        rm -rf "${APP_DIR}"
        
        # Restaurer la sauvegarde
        mv "\$last_backup" "${APP_DIR}"
        
        echo "Démarrage des services..."
        sudo systemctl start educours-backend
        sudo systemctl start educours-frontend
        
        echo "Nettoyage des autres sauvegardes..."
        ls -dt ${APP_DIR}_old_* | tail -n +2 | xargs rm -rf || true
EOF
    
    echo -e "${GREEN}[OK] Rollback terminé${NC}"
}

# Notification
notify() {
    local status="$1"
    local message="$2"
    
    echo -e "${BLUE}[NOTIFY] Envoi de notifications...${NC}"
    
    # Slack
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Déploiement ${ENVIRONMENT} ${VERSION}: ${status}\n${message}\"}" \
            "$SLACK_WEBHOOK" || true
    fi
    
    # Email
    if [ -n "$EMAIL_TO" ] && [ -f "backend/src/services/email.service.js" ]; then
        ssh ${SSH_USER}@${SSH_HOST} << EOF
            cd ${APP_DIR}/backend
            node -e "
                const email = require('./src/services/email.service.js');
                email.send({
                    to: '${EMAIL_TO}',
                    subject: 'Déploiement ${ENVIRONMENT} ${VERSION} - ${status}',
                    text: '${message}'
                });
            "
EOF
    fi
    
    echo -e "${GREEN}[OK] Notifications envoyées${NC}"
}

# Journalisation
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        ERROR) echo -e "${RED}$message${NC}" ;;
        WARN) echo -e "${YELLOW}$message${NC}" ;;
        INFO) echo -e "${BLUE}$message${NC}" ;;
        SUCCESS) echo -e "${GREEN}$message${NC}" ;;
        *) echo "$message" ;;
    esac
}

# Point d'entrée principal
main() {
    log "INFO" "=== DÉMARRAGE DU DÉPLOIEMENT ==="
    log "INFO" "Environnement: $ENVIRONMENT"
    log "INFO" "Version: $VERSION"
    
    local start_time=$(date +%s)
    
    # Gestion des erreurs
    trap 'error_handler' ERR
    
    error_handler() {
        local error_code=$?
        log "ERROR" "Échec du déploiement (code: $error_code)"
        
        # Tentative de rollback
        if [ -n "$SSH_HOST" ]; then
            rollback || true
        fi
        
        notify "ÉCHEC" "Le déploiement a échoué. Rollback effectué."
        
        exit $error_code
    }
    
    # Flux de déploiement
    init
    backup
    prepare
    deploy
    
    if verify; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "SUCCESS" "Déploiement réussi en ${duration}s"
        notify "SUCCÈS" "L'application est opérationnelle sur ${ENVIRONMENT}"
    else
        log "ERROR" "Échec de la vérification"
        rollback
        notify "ÉCHEC" "La vérification a échoué. Rollback effectué."
        exit 1
    fi
    
    log "INFO" "=== DÉPLOIEMENT TERMINÉ ==="
}

# Exécution
main "$@"