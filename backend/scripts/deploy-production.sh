#!/bin/bash

# SciConnect Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sciconnect"
DEPLOY_PATH="/var/www/sciconnect"
BACKUP_PATH="/var/backups/sciconnect"
LOG_PATH="/var/log/sciconnect"

echo -e "${BLUE}🚀 Starting SciConnect Production Deployment${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    command -v node >/dev/null 2>&1 || error "Node.js is not installed"
    command -v npm >/dev/null 2>&1 || error "npm is not installed"
    command -v pm2 >/dev/null 2>&1 || error "PM2 is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    command -v nginx >/dev/null 2>&1 || warning "Nginx is not installed (optional for reverse proxy)"
    
    log "Dependencies check completed"
}

# Create necessary directories
setup_directories() {
    log "Setting up directories..."
    
    sudo mkdir -p $DEPLOY_PATH
    sudo mkdir -p $BACKUP_PATH
    sudo mkdir -p $LOG_PATH
    sudo mkdir -p $DEPLOY_PATH/logs
    
    # Set proper permissions
    sudo chown -R $USER:$USER $DEPLOY_PATH
    sudo chown -R $USER:$USER $BACKUP_PATH
    sudo chown -R $USER:$USER $LOG_PATH
    
    log "Directories setup completed"
}

# Backup current deployment
backup_current() {
    if [ -d "$DEPLOY_PATH" ] && [ "$(ls -A $DEPLOY_PATH)" ]; then
        log "Creating backup of current deployment..."
        BACKUP_FILE="$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf $BACKUP_FILE -C $DEPLOY_PATH .
        log "Backup created: $BACKUP_FILE"
    fi
}

# Clone/pull latest code
update_code() {
    log "Updating application code..."
    
    if [ ! -d "$DEPLOY_PATH/.git" ]; then
        # First time deployment
        git clone https://github.com/yourusername/sciconnect.git $DEPLOY_PATH
    else
        # Update existing deployment
        cd $DEPLOY_PATH
        git fetch origin
        git reset --hard origin/main
    fi
    
    log "Code update completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd $DEPLOY_PATH
    
    # Install backend dependencies
    npm ci --production
    
    # Install frontend dependencies and build
    cd frontend
    npm ci
    npm run build
    cd ..
    
    log "Dependencies installation completed"
}

# Security checks
security_checks() {
    log "Running security checks..."
    
    cd $DEPLOY_PATH
    
    # Run npm audit
    if npm audit --audit-level=moderate; then
        log "Security audit passed"
    else
        warning "Security audit found vulnerabilities. Consider running 'npm audit fix'"
    fi
    
    # Check for environment file
    if [ ! -f ".env" ]; then
        error "Environment file (.env) not found. Please create it with proper configuration."
    fi
    
    log "Security checks completed"
}

# Database migration
run_migrations() {
    log "Running database migrations..."
    
    cd $DEPLOY_PATH
    
    # Check if database is accessible
    if npm run migrate:dry-run; then
        log "Database connection verified"
    else
        error "Database connection failed. Please check your database configuration."
    fi
    
    # Run migrations
    if npm run migrate; then
        log "Database migrations completed"
    else
        error "Database migration failed"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    cd $DEPLOY_PATH
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    log "Application build completed"
}

# Deploy with PM2
deploy_pm2() {
    log "Deploying with PM2..."
    
    cd $DEPLOY_PATH
    
    # Stop existing processes
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start new deployment
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    log "PM2 deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 5
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        log "Health check passed"
    else
        warning "Health check failed. Application may not be fully started yet."
    fi
}

# Setup Nginx (optional)
setup_nginx() {
    if command -v nginx >/dev/null 2>&1; then
        log "Setting up Nginx configuration..."
        
        # Create Nginx configuration
        sudo tee /etc/nginx/sites-available/sciconnect >/dev/null <<EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location /static/ {
        alias $DEPLOY_PATH/frontend/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/sciconnect /etc/nginx/sites-enabled/
        
        # Test Nginx configuration
        if sudo nginx -t; then
            sudo systemctl reload nginx
            log "Nginx configuration completed"
        else
            warning "Nginx configuration test failed"
        fi
    else
        warning "Nginx not installed. Skipping reverse proxy setup."
    fi
}

# Main deployment process
main() {
    log "Starting deployment process..."
    
    check_dependencies
    setup_directories
    backup_current
    update_code
    install_dependencies
    security_checks
    run_migrations
    build_application
    deploy_pm2
    health_check
    setup_nginx
    
    log "🎉 Deployment completed successfully!"
    log "Application is running at: http://localhost:3000"
    log "PM2 status: pm2 status"
    log "PM2 logs: pm2 logs $APP_NAME"
}

# Run main function
main "$@" 