# 🚀 SciConnect Production Deployment Guide

This guide will help you deploy SciConnect to production with enterprise-grade security, monitoring, and performance.

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 20GB+ SSD
- **Network**: Stable internet connection

### Software Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **PostgreSQL**: 13+ (or MySQL 8+)
- **Redis**: 6+ (for sessions and caching)
- **Nginx**: 1.18+ (optional, for reverse proxy)
- **PM2**: For process management
- **Git**: For code deployment

## 🔧 Installation Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx (optional)
sudo apt install nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE sciconnect;
CREATE USER sciconnect_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sciconnect TO sciconnect_user;
ALTER USER sciconnect_user CREATEDB;
\q

# Test connection
psql -h localhost -U sciconnect_user -d sciconnect
```

### 3. Redis Configuration

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Add/modify these settings:
bind 127.0.0.1
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis
```

### 4. Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/sciconnect.git /var/www/sciconnect
cd /var/www/sciconnect

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Create environment file
cp env.example .env
nano .env
```

### 5. Environment Configuration

Edit `.env` file with your production settings:

```env
# Application
NODE_ENV=production
PORT=3000
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Security (Generate secure secrets)
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
SESSION_SECRET=your-super-secure-session-secret-here

# Database
DATABASE_URL=postgresql://sciconnect_user:your_secure_password@localhost:5432/sciconnect

# Redis
REDIS_URL=redis://localhost:6379

# Email (Configure your email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 6. Database Migration

```bash
# Run migrations
npm run migrate

# Verify database setup
npm run check-data
```

### 7. Build Application

```bash
# Build frontend
cd frontend
npm run build
cd ..
```

### 8. Deploy with PM2

```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/sciconnect`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /static/ {
        alias /var/www/sciconnect/frontend/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/sciconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring

```bash
# View application status
pm2 status

# Monitor resources
pm2 monit

# View logs
pm2 logs sciconnect-api

# Restart application
pm2 restart sciconnect-api
```

### 2. Health Checks

```bash
# Basic health check
curl http://localhost:3000/api/health

# Detailed health check
curl http://localhost:3000/api/health/detailed
```

### 3. Log Management

```bash
# View application logs
tail -f /var/www/sciconnect/logs/application-$(date +%Y-%m-%d).log

# View error logs
tail -f /var/www/sciconnect/logs/error-$(date +%Y-%m-%d).log

# View security logs
tail -f /var/www/sciconnect/logs/security-$(date +%Y-%m-%d).log
```

### 4. Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-sciconnect.sh

#!/bin/bash
BACKUP_DIR="/var/backups/sciconnect"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sciconnect_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U sciconnect_user sciconnect > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-sciconnect.sh

# Add to crontab for daily backups
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-sciconnect.sh
```

## 🔄 Deployment Updates

### Automated Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

### Manual Updates

```bash
# Pull latest code
cd /var/www/sciconnect
git pull origin main

# Install dependencies
npm install
cd frontend && npm install && npm run build && cd ..

# Run migrations
npm run migrate

# Restart application
pm2 restart sciconnect-api
```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs sciconnect-api
   
   # Check environment
   pm2 env sciconnect-api
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   psql -h localhost -U sciconnect_user -d sciconnect
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Redis connection issues**
   ```bash
   # Test Redis connection
   redis-cli ping
   
   # Check Redis status
   sudo systemctl status redis
   ```

4. **Nginx issues**
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check Nginx status
   sudo systemctl status nginx
   ```

### Performance Optimization

1. **Enable compression**
   ```bash
   # Already configured in the application
   ```

2. **Database optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_posts_created_at ON posts(created_at);
   CREATE INDEX idx_users_email ON users(email);
   ```

3. **Redis optimization**
   ```bash
   # Monitor Redis memory usage
   redis-cli info memory
   ```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Instances**: Run multiple PM2 instances
3. **Database Replication**: Set up PostgreSQL read replicas
4. **Redis Cluster**: For high availability

### Vertical Scaling

1. **Increase Server Resources**: More CPU, RAM, SSD
2. **Database Optimization**: Connection pooling, query optimization
3. **Caching**: Implement Redis caching strategies

## 🔐 Security Checklist

- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] Strong passwords set
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation implemented

## 📞 Support

For production support and issues:

1. Check the logs: `/var/www/sciconnect/logs/`
2. Monitor application health: `/api/health`
3. Review PM2 status: `pm2 status`
4. Check system resources: `htop`, `df -h`

## 🎯 Next Steps

1. **Set up monitoring**: Configure alerts for downtime, errors, and performance
2. **Implement CI/CD**: Set up automated testing and deployment
3. **Add analytics**: Track user behavior and application performance
4. **Plan for growth**: Consider scaling strategies as user base grows

---

**Congratulations!** 🎉 Your SciConnect application is now running in production with enterprise-grade security and monitoring. 