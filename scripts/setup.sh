#!/bin/bash
# setup.sh - Script d'installation professionnel pour EduCours Platform
# Usage: ./setup.sh [--prod|--dev|--test]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENV="development"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="setup_${TIMESTAMP}.log"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

check_dependencies() {
    log_info "Vérification des dépendences système..."
    
    local missing_deps=()
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        log_info "Node.js version: $NODE_VERSION"
    fi
    
    # Vérifier npm/yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        missing_deps+=("npm ou yarn")
    fi
    
    # Vérifier Docker
    if [ "$ENV" = "production" ] || [ "$ENV" = "docker" ]; then
        if ! command -v docker &> /dev/null; then
            missing_deps+=("Docker")
        fi
        if ! command -v docker-compose &> /dev/null; then
            missing_deps+=("Docker Compose")
        fi
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Dépendances manquantes: ${missing_deps[*]}"
    fi
    
    log_success "Toutes les dépendances sont installées"
}

setup_backend() {
    log_info "Configuration du backend..."
    
    cd backend || log_error "Dossier backend introuvable"
    
    # Copier les fichiers d'environnement
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "Fichier .env créé depuis .env.example. Veuillez le configurer."
        else
            log_error ".env.example non trouvé"
        fi
    fi
    
    # Installer les dépendances
    log_info "Installation des dépendances Node.js..."
    if [ -f yarn.lock ]; then
        yarn install --frozen-lockfile
    else
        npm ci
    fi
    
    # Vérifier la structure de dossiers
    mkdir -p uploads/profiles uploads/materials uploads/assignments
    mkdir -p logs
    
    # Donner les permissions
    chmod 755 uploads
    chmod -R 755 logs
    
    # Vérifier les fichiers de configuration
    if [ ! -f src/config/database.js ]; then
        log_warning "Création du fichier de configuration de base de données..."
        cat > src/config/database.js << 'EOF'
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        logger.info(`MongoDB connecté: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
EOF
    fi
    
    cd ..
    log_success "Backend configuré avec succès"
}

setup_frontend() {
    log_info "Configuration du frontend..."
    
    cd frontend || log_error "Dossier frontend introuvable"
    
    # Copier les fichiers d'environnement
    if [ ! -f .env.local ]; then
        if [ -f .env.example ]; then
            cp .env.example .env.local
            log_warning "Fichier .env.local créé. Veuillez le configurer."
        fi
    fi
    
    # Installer les dépendances
    log_info "Installation des dépendances Vue.js..."
    if [ -f yarn.lock ]; then
        yarn install --frozen-lockfile
    else
        npm ci
    fi
    
    # Vérifier la structure
    mkdir -p src/assets/uploads
    
    cd ..
    log_success "Frontend configuré avec succès"
}

setup_database() {
    log_info "Configuration de la base de données..."
    
    if [ "$ENV" = "production" ]; then
        log_warning "En production, configurez manuellement votre base de données"
        return 0
    fi
    
    # Vérifier si Docker est disponible pour MongoDB local
    if command -v docker &> /dev/null; then
        log_info "Lancement de MongoDB avec Docker..."
        
        if ! docker ps | grep -q educours-mongodb; then
            docker run -d \
                --name educours-mongodb \
                -p 27017:27017 \
                -v educours-mongodb-data:/data/db \
                -e MONGO_INITDB_ROOT_USERNAME=admin \
                -e MONGO_INITDB_ROOT_PASSWORD=$(openssl rand -base64 32) \
                mongo:6.0
            
            sleep 5  # Attendre que MongoDB démarre
        else
            log_info "MongoDB est déjà en cours d'exécution"
        fi
    else
        log_warning "Docker non trouvé. Assurez-vous que MongoDB est en cours d'exécution"
    fi
    
    # Exécuter les migrations
    if [ -f "backend/scripts/migrate.js" ]; then
        log_info "Exécution des migrations de base de données..."
        cd backend
        node scripts/migrate.js
        cd ..
    fi
    
    # Créer l'utilisateur admin
    if [ -f "database/seeds/admin_user.js" ]; then
        log_info "Création de l'utilisateur administrateur..."
        cd backend
        node ../database/seeds/admin_user.js
        cd ..
    fi
    
    log_success "Base de données configurée"
}

setup_nginx() {
    log_info "Configuration de Nginx..."
    
    if [ ! -d "nginx" ]; then
        mkdir -p nginx/ssl nginx/logs
        
        # Créer la configuration Nginx par défaut
        cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/atom+xml image/svg+xml;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://frontend:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /api {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF
        
        log_warning "Configuration Nginx créée. Ajustez-la selon vos besoins."
    fi
    
    log_success "Nginx configuré"
}

generate_ssl() {
    log_info "Génération des certificats SSL de développement..."
    
    if [ ! -d "nginx/ssl" ]; then
        mkdir -p nginx/ssl
    fi
    
    cd nginx/ssl
    
    # Générer une clé privée
    openssl genrsa -out educours.key 2048 2>/dev/null || {
        log_warning "OpenSSL non disponible. Impossible de générer les certificats SSL."
        return 0
    }
    
    # Générer un CSR
    openssl req -new -key educours.key -out educours.csr \
        -subj "/C=MA/ST=Casablanca/L=Casablanca/O=EduCours/CN=localhost" 2>/dev/null || {
        log_warning "Échec de la génération du CSR"
        return 0
    }
    
    # Générer un certificat auto-signé
    openssl x509 -req -days 365 -in educours.csr -signkey educours.key -out educours.crt 2>/dev/null || {
        log_warning "Échec de la génération du certificat"
        return 0
    }
    
    # Nettoyer
    rm educours.csr
    
    # Vérifier les permissions
    chmod 600 educours.key
    chmod 644 educours.crt
    
    cd ../..
    log_success "Certificats SSL de développement générés"
}

setup_environment() {
    log_info "Configuration de l'environnement $ENV..."
    
    case $ENV in
        production)
            # Configuration production
            export NODE_ENV=production
            ;;
        development)
            # Configuration développement
            export NODE_ENV=development
            ;;
        test)
            # Configuration test
            export NODE_ENV=test
            ;;
        docker)
            # Configuration Docker
            export NODE_ENV=production
            ;;
    esac
    
    # Créer les dossiers nécessaires
    mkdir -p logs backups uploads
    
    log_success "Environnement $ENV configuré"
}

run_security_check() {
    log_info "Vérification de sécurité..."
    
    # Vérifier les permissions sensibles
    find . -name "*.key" -o -name "*.pem" -o -name ".env*" | while read -r file; do
        if [ -f "$file" ]; then
            perms=$(stat -c "%a" "$file")
            if [ "$perms" = "644" ] || [ "$perms" = "600" ]; then
                log_success "Permissions OK pour $file: $perms"
            else
                log_warning "Permissions suspectes pour $file: $perms"
            fi
        fi
    done
    
    # Vérifier les dépendances vulnérables
    if [ -f "backend/package.json" ]; then
        cd backend
        if command -v npm &> /dev/null; then
            log_info "Vérification des vulnérabilités npm..."
            npm audit --audit-level=moderate || true
        fi
        cd ..
    fi
    
    log_success "Vérification de sécurité terminée"
}

create_service_files() {
    log_info "Création des fichiers de service systemd..."
    
    if [ "$ENV" != "production" ]; then
        log_info "Ignoré (uniquement pour la production)"
        return 0
    fi
    
    # Service backend
    cat > /etc/systemd/system/educours-backend.service << EOF
[Unit]
Description=EduCours Backend API
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=educours
Group=educours
WorkingDirectory=/opt/educours/backend
Environment=NODE_ENV=production
EnvironmentFile=/opt/educours/backend/.env
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=educours-backend

[Install]
WantedBy=multi-user.target
EOF
    
    # Service frontend
    cat > /etc/systemd/system/educours-frontend.service << EOF
[Unit]
Description=EduCours Frontend
After=network.target educours-backend.service
Requires=educours-backend.service

[Service]
Type=simple
User=educours
Group=educours
WorkingDirectory=/opt/educours/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run serve
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=educours-frontend

[Install]
WantedBy=multi-user.target
EOF
    
    log_warning "Fichiers de service créés. Exécutez: sudo systemctl daemon-reload"
}

print_summary() {
    log_success "=== INSTALLATION TERMINÉE ==="
    echo ""
    
    case $ENV in
        development)
            echo "🎯 ENVIRONNEMENT: DÉVELOPPEMENT"
            echo ""
            echo "Pour démarrer:"
            echo "1. Backend: cd backend && npm run dev"
            echo "2. Frontend: cd frontend && npm run dev"
            echo ""
            echo "📊 Accès:"
            echo "   Frontend: http://localhost:5173"
            echo "   Backend API: http://localhost:3000"
            echo "   MongoDB: mongodb://localhost:27017"
            ;;
        production)
            echo "🚀 ENVIRONNEMENT: PRODUCTION"
            echo ""
            echo "Commandes utiles:"
            echo "  sudo systemctl start educours-backend"
            echo "  sudo systemctl start educours-frontend"
            echo "  sudo systemctl status educours-backend"
            echo ""
            echo "📊 Monitoring:"
            echo "  Journaux: sudo journalctl -u educours-backend -f"
            echo "  Supervision: configurer un outil comme PM2"
            ;;
        docker)
            echo "🐳 ENVIRONNEMENT: DOCKER"
            echo ""
            echo "Pour démarrer:"
            echo "  docker-compose up -d"
            echo ""
            echo "📊 Accès:"
            echo "   Application: http://localhost"
            echo "   Backend API: http://localhost/api"
            echo "   Adminer (DB): http://localhost:8081"
            ;;
    esac
    
    echo ""
    echo "🔧 Prochaines étapes:"
    echo "1. Configurez les variables d'environnement"
    echo "2. Vérifiez la connexion à la base de données"
    echo "3. Testez l'application"
    echo ""
    echo "📄 Journaux: $LOG_FILE"
    echo "======================================"
}

# Gestion des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production)
            ENV="production"
            shift
            ;;
        --dev|--development)
            ENV="development"
            shift
            ;;
        --docker)
            ENV="docker"
            shift
            ;;
        --test)
            ENV="test"
            shift
            ;;
        *)
            log_error "Argument invalide: $1"
            ;;
    esac
done

# En-tête
echo ""
echo "======================================"
echo "   INSTALLATION EDUCOURS PLATFORM    "
echo "   Environnement: $ENV               "
echo "======================================"
echo ""

# Exécution principale
main() {
    log_info "Début de l'installation..."
    
    # Vérifier les privilèges
    if [ "$ENV" = "production" ] && [ "$EUID" -ne 0 ]; then
        log_error "L'installation en production nécessite les privilèges root"
    fi
    
    # Étapes d'installation
    check_dependencies
    setup_environment
    setup_backend
    setup_frontend
    
    if [ "$ENV" = "docker" ]; then
        setup_nginx
        generate_ssl
    else
        setup_database
    fi
    
    if [ "$ENV" = "production" ]; then
        create_service_files
    fi
    
    run_security_check
    print_summary
    
    log_success "Installation terminée avec succès!"
}

# Exécuter le script
main "$@"