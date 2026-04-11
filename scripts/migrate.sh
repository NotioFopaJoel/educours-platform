#!/bin/bash
# migrate.sh - Script de migration de base de données avec rollback
# Usage: ./migrate.sh [up|down|status] [version]

set -euo pipefail

# Configuration
MIGRATIONS_DIR="./database/migrations"
MIGRATION_TEMPLATE="./templates/migration.template"
LOG_DIR="./logs/migrations"
ENVIRONMENT="${NODE_ENV:-development}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/migrate_${TIMESTAMP}.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Initialisation
init() {
    mkdir -p "$LOG_DIR"
    mkdir -p "$MIGRATIONS_DIR"
    
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
    
    echo -e "${BLUE}=== MIGRATION DE BASE DE DONNÉES ===${NC}"
    echo "Environnement: $ENVIRONMENT"
    echo "Date: $(date)"
    echo "Log: $LOG_FILE"
    echo ""
    
    # Charger les variables d'environnement
    if [ -f "./backend/.env" ]; then
        export $(grep -v '^#' ./backend/.env | xargs)
    fi
}

# Vérifier la connexion à la base de données
check_database() {
    echo -e "${BLUE}Vérification de la base de données...${NC}"
    
    # MongoDB
    if [ -n "$MONGODB_URI" ]; then
        if ! mongo --quiet "$MONGODB_URI" --eval "db.adminCommand('ping')" > /dev/null; then
            echo -e "${RED}✗ Impossible de se connecter à MongoDB${NC}"
            return 1
        fi
        echo -e "${GREEN}✓ MongoDB connecté${NC}"
    fi
    
    # PostgreSQL
    if [ -n "$DATABASE_URL" ]; then
        if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
            echo -e "${RED}✗ Impossible de se connecter à PostgreSQL${NC}"
            return 1
        fi
        echo -e "${GREEN}✓ PostgreSQL connecté${NC}"
    fi
    
    return 0
}

# Créer une nouvelle migration
create_migration() {
    local name="$1"
    local timestamp=$(date +%Y%m%d%H%M%S)
    local filename="${timestamp}_${name}.js"
    local filepath="${MIGRATIONS_DIR}/${filename}"
    
    echo -e "${BLUE}Création de la migration: $name${NC}"
    
    if [ -f "$MIGRATION_TEMPLATE" ]; then
        cp "$MIGRATION_TEMPLATE" "$filepath"
    else
        # Template par défaut
        cat > "$filepath" << 'EOF'
const mongoose = require('mongoose');

module.exports = {
    async up(db) {
        // Code pour appliquer la migration
        await db.collection('migrations').insertOne({
            name: '<%= migrationName %>',
            appliedAt: new Date()
        });
    },

    async down(db) {
        // Code pour annuler la migration
        await db.collection('migrations').deleteOne({
            name: '<%= migrationName %>'
        });
    }
};
EOF
    fi
    
    # Remplacer le nom dans le template
    sed -i "s/<%= migrationName %>/${name}/g" "$filepath"
    
    echo -e "${GREEN}✓ Migration créée: ${filepath}${NC}"
    echo "N'oubliez pas d'implémenter les méthodes up() et down() !"
}

# Exécuter les migrations vers le haut
migrate_up() {
    local target_version="$1"
    
    echo -e "${BLUE}Exécution des migrations...${NC}"
    
    # Récupérer les migrations appliquées
    local applied_migrations=()
    if mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({}, {name:1}).toArray()" 2>/dev/null | grep -q "name"; then
        applied_migrations=($(mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({}, {name:1}).toArray()" | grep -o '"[^"]*"' | tr -d '"'))
    fi
    
    # Trouver les migrations à appliquer
    local migrations_to_apply=()
    for migration_file in "${MIGRATIONS_DIR}"/*.js; do
        if [ -f "$migration_file" ]; then
            local migration_name=$(basename "$migration_file" .js)
            
            # Vérifier si déjà appliquée
            local is_applied=false
            for applied in "${applied_migrations[@]}"; do
                if [[ "$migration_name" == *"$applied"* ]]; then
                    is_applied=true
                    break
                fi
            done
            
            if [ "$is_applied" = false ]; then
                migrations_to_apply+=("$migration_file")
            fi
        fi
    done
    
    # Trier par timestamp
    IFS=$'\n' migrations_to_apply=($(sort <<<"${migrations_to_apply[*]}"))
    unset IFS
    
    # Appliquer les migrations
    local applied_count=0
    for migration_file in "${migrations_to_apply[@]}"; do
        local migration_name=$(basename "$migration_file" .js)
        
        # Vérifier la version cible
        if [ -n "$target_version" ] && [[ "$migration_name" > "$target_version" ]]; then
            break
        fi
        
        echo -e "  Appliquer: ${migration_name}"
        
        # Exécuter la migration
        if node -e "
            const migration = require('./${migration_file}');
            const mongoose = require('mongoose');
            
            async function run() {
                await mongoose.connect(process.env.MONGODB_URI);
                const db = mongoose.connection.db;
                
                try {
                    await migration.up(db);
                    console.log('✓ Migration appliquée');
                } catch (error) {
                    console.error('✗ Erreur:', error.message);
                    process.exit(1);
                }
            }
            
            run();
        "; then
            applied_count=$((applied_count + 1))
        else
            echo -e "${RED}✗ Échec de la migration: ${migration_name}${NC}"
            return 1
        fi
    done
    
    if [ $applied_count -gt 0 ]; then
        echo -e "${GREEN}✓ ${applied_count} migration(s) appliquée(s)${NC}"
    else
        echo -e "${YELLOW}✓ Aucune nouvelle migration à appliquer${NC}"
    fi
}

# Annuler les migrations
migrate_down() {
    local steps="${1:-1}"
    
    echo -e "${BLUE}Annulation des migrations (steps: ${steps})...${NC}"
    
    # Récupérer les migrations appliquées (les plus récentes d'abord)
    local applied_migrations=()
    if mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({}, {name:1, appliedAt:1}).sort({appliedAt: -1}).toArray()" 2>/dev/null | grep -q "name"; then
        applied_migrations=($(mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({}, {name:1}).sort({appliedAt: -1}).toArray()" | grep -o '"[^"]*"' | tr -d '"'))
    fi
    
    # Annuler les migrations
    local reverted_count=0
    for ((i=0; i<steps && i<${#applied_migrations[@]}; i++)); do
        local migration_name="${applied_migrations[$i]}"
        local migration_file=$(find "$MIGRATIONS_DIR" -name "*${migration_name}*" -type f)
        
        if [ -f "$migration_file" ]; then
            echo -e "  Annuler: ${migration_name}"
            
            # Exécuter la migration down
            if node -e "
                const migration = require('./${migration_file}');
                const mongoose = require('mongoose');
                
                async function run() {
                    await mongoose.connect(process.env.MONGODB_URI);
                    const db = mongoose.connection.db;
                    
                    try {
                        await migration.down(db);
                        console.log('✓ Migration annulée');
                    } catch (error) {
                        console.error('✗ Erreur:', error.message);
                        process.exit(1);
                    }
                }
                
                run();
            "; then
                reverted_count=$((reverted_count + 1))
            else
                echo -e "${RED}✗ Échec de l'annulation: ${migration_name}${NC}"
                return 1
            fi
        fi
    done
    
    if [ $reverted_count -gt 0 ]; then
        echo -e "${GREEN}✓ ${reverted_count} migration(s) annulée(s)${NC}"
    else
        echo -e "${YELLOW}✓ Aucune migration à annuler${NC}"
    fi
}

# Statut des migrations
migrate_status() {
    echo -e "${BLUE}Statut des migrations...${NC}"
    
    # Récupérer les migrations appliquées
    local applied_migrations=()
    if mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({}, {name:1, appliedAt:1}).sort({appliedAt: 1}).toArray()" 2>/dev/null | grep -q "name"; then
        applied_migrations=($(mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({}, {name:1, appliedAt:1}).sort({appliedAt: 1}).toArray()" | 
            grep -E 'name|appliedAt' | 
            sed 's/.*"\(.*\)".*/\1/'))
    fi
    
    # Afficher le statut
    echo "Migrations appliquées:"
    if [ ${#applied_migrations[@]} -eq 0 ]; then
        echo "  Aucune"
    else
        for ((i=0; i<${#applied_migrations[@]}; i+=2)); do
            echo "  ${applied_migrations[$i]} (${applied_migrations[$((i+1))]})"
        done
    fi
    
    # Vérifier les migrations en attente
    echo ""
    echo "Migrations en attente:"
    local pending_count=0
    for migration_file in "${MIGRATIONS_DIR}"/*.js; do
        if [ -f "$migration_file" ]; then
            local migration_name=$(basename "$migration_file" .js)
            local is_applied=false
            
            for applied in "${applied_migrations[@]}"; do
                if [[ "$applied" == *"${migration_name:11}"* ]]; then
                    is_applied=true
                    break
                fi
            done
            
            if [ "$is_applied" = false ]; then
                echo "  ${migration_name}"
                pending_count=$((pending_count + 1))
            fi
        fi
    done
    
    if [ $pending_count -eq 0 ]; then
        echo "  Aucune"
    fi
    
    echo ""
    echo "Total: ${#applied_migrations[@]/2} appliquée(s), ${pending_count} en attente"
}

# Nettoyer les migrations échouées
cleanup_failed() {
    echo -e "${BLUE}Nettoyage des migrations échouées...${NC}"
    
    # Vérifier s'il y a des migrations partiellement appliquées
    local failed_count=$(mongo --quiet "$MONGODB_URI" --eval "db.migrations.find({status: 'failed'}).count()" 2>/dev/null || echo "0")
    
    if [ "$failed_count" -gt 0 ]; then
        echo "  Trouvé $failed_count migration(s) échouée(s)"
        
        mongo "$MONGODB_URI" << EOF
            db.migrations.deleteMany({status: 'failed'});
            print('✓ Migrations échouées nettoyées');
EOF
    else
        echo -e "${GREEN}✓ Aucune migration échouée${NC}"
    fi
}

# Validation des migrations
validate_migrations() {
    echo -e "${BLUE}Validation des migrations...${NC}"
    
    local has_errors=false
    
    for migration_file in "${MIGRATIONS_DIR}"/*.js; do
        if [ -f "$migration_file" ]; then
            # Vérifier la syntaxe
            if ! node -c "$migration_file" > /dev/null 2>&1; then
                echo -e "  ${RED}✗ Syntaxe invalide: $(basename "$migration_file")${NC}"
                has_errors=true
                continue
            fi
            
            # Vérifier la structure
            if ! node -e "
                const migration = require('./${migration_file}');
                if (!migration.up || typeof migration.up !== 'function') {
                    throw new Error('Méthode up() manquante');
                }
                if (!migration.down || typeof migration.down !== 'function') {
                    throw new Error('Méthode down() manquante');
                }
            " > /dev/null 2>&1; then
                echo -e "  ${RED}✗ Structure invalide: $(basename "$migration_file")${NC}"
                has_errors=true
            else
                echo -e "  ${GREEN}✓ $(basename "$migration_file")${NC}"
            fi
        fi
    done
    
    if [ "$has_errors" = true ]; then
        echo -e "${RED}✗ Certaines migrations sont invalides${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Toutes les migrations sont valides${NC}"
        return 0
    fi
}

# Générer un rapport
generate_report() {
    local report_file="${LOG_DIR}/report_${TIMESTAMP}.md"
    
    cat > "$report_file" << EOF
# Rapport de Migration
- **Date**: $(date)
- **Environnement**: $ENVIRONMENT
- **Action**: $1
- **Version**: $2

## Résumé
\`\`\`
$(tail -20 "$LOG_FILE")
\`\`\`

## Base de données
- MongoDB: $MONGODB_URI
- PostgreSQL: $(echo "$DATABASE_URL" | sed 's/:[^:]*@/:***@/')

## Statut
$(migrate_status 2>&1 | sed 's/^/  /')

## Fichiers de migration
\`\`\`
$(ls -la "$MIGRATIONS_DIR")
\`\`\`
EOF
    
    echo -e "${GREEN}✓ Rapport généré: ${report_file}${NC}"
}

# Point d'entrée principal
main() {
    local action="${1:-status}"
    local argument="${2:-}"
    
    init
    check_database || exit 1
    
    case $action in
        create)
            if [ -z "$argument" ]; then
                echo -e "${RED}Usage: $0 create <migration_name>${NC}"
                exit 1
            fi
            create_migration "$argument"
            ;;
        up)
            migrate_up "$argument"
            ;;
        down)
            migrate_down "$argument"
            ;;
        status)
            migrate_status
            ;;
        validate)
            validate_migrations
            ;;
        cleanup)
            cleanup_failed
            ;;
        *)
            echo -e "${RED}Action inconnue: $action${NC}"
            echo "Usage: $0 [create|up|down|status|validate|cleanup] [argument]"
            exit 1
            ;;
    esac
    
    generate_report "$action" "$argument"
    
    echo -e "${GREEN}=== MIGRATION TERMINÉE ===${NC}"
}

# Exécuter
main "$@"