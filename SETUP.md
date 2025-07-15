# 🚀 SciConnect Phase 2 Setup Guide

## 📋 Prerequisites

Before starting Phase 2, you'll need to set up PostgreSQL and optionally Redis for the best experience.

### Required:
- **PostgreSQL** (version 12 or higher)
- **Node.js** (version 16 or higher)

### Optional but Recommended:
- **Redis** (for caching and sessions)
- **Cloudinary** account (for media storage)

## 🐘 PostgreSQL Setup

### Option 1: Local Installation

#### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
createdb sciconnect
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb sciconnect
```

#### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Follow the installation wizard
3. Use pgAdmin or command line to create database `sciconnect`

### Option 2: Docker
```bash
docker run --name postgres-sciconnect \
  -e POSTGRES_DB=sciconnect \
  -e POSTGRES_USER=sciconnect_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### Option 3: Cloud Services
- **AWS RDS**: Use PostgreSQL instance
- **Google Cloud SQL**: Use PostgreSQL instance  
- **Heroku Postgres**: Free tier available
- **Railway**: Simple PostgreSQL hosting

## 🔧 Environment Configuration

Create a `.env` file in your project root with the following configuration:

```env
# Database Configuration
POSTGRES_URL=postgresql://username:password@localhost:5432/sciconnect

# Optional: Redis for caching (improves performance)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Email Configuration (for verification/reset emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Optional: OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Optional: Cloudinary for media storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Settings
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 📊 Data Migration from SQLite to PostgreSQL

### Step 1: Backup Your Current Data
```bash
# Create a backup of your SQLite database
cp database.sqlite database.sqlite.backup
```

### Step 2: Set Up PostgreSQL
Ensure your PostgreSQL database is running and accessible with the credentials in your `.env` file.

### Step 3: Run Migration
```bash
# Test connection first
npm run migrate:dry-run

# Run the actual migration
npm run migrate
```

The migration script will:
- ✅ Connect to both SQLite and PostgreSQL
- ✅ Create all necessary tables in PostgreSQL
- ✅ Transfer all your data (users, posts, comments, etc.)
- ✅ Preserve all relationships and data integrity
- ✅ Show detailed progress and results

### Step 4: Verify Migration
```bash
# Start the server with PostgreSQL
npm run dev
```

Your server should now display:
```
🐘 Using PostgreSQL database
✅ PostgreSQL connection established
```

## 🔄 Optional: Redis Setup

### Local Installation:

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian:
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

### Docker:
```bash
docker run --name redis-sciconnect -p 6379:6379 -d redis:7
```

## 📧 Email Configuration

### Gmail Setup:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password (not your regular password) in `EMAIL_PASS`

### Other Email Providers:
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **Outlook**: `smtp-mail.outlook.com:587`

## 🖼️ Cloudinary Setup (Optional)

1. Create a free account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Add them to your `.env` file

Benefits:
- ✅ Automatic image optimization
- ✅ Multiple format support
- ✅ CDN delivery
- ✅ Unlimited storage (free tier: 25GB)

## 🚀 Phase 2 Features

Once your migration is complete, you'll have access to:

### ✅ Enhanced Authentication
- OAuth login (Google/Facebook)
- Email verification
- Password reset
- Refresh tokens
- Account security features

### ✅ Scalable Infrastructure
- PostgreSQL for robust data management
- Redis for high-performance caching
- Cloud media storage with Cloudinary

### 🔜 Upcoming in Phase 2
- Group chat functionality
- Advanced notifications system
- Enhanced feed ranking
- Real-time messaging improvements

## 🔍 Troubleshooting

### Common Issues:

#### 1. PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and accessible.

#### 2. Migration Fails
**Solution**: Check your `POSTGRES_URL` format and database permissions.

#### 3. Redis Connection Warning
```
Redis connection failed
```
**Solution**: This is optional. App will work without Redis but with reduced performance.

#### 4. Email Not Sending
**Solution**: Verify your email credentials and app password setup.

### Getting Help:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connections individually
4. Ensure all required services are running

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] Database connection shows PostgreSQL
- [ ] User registration/login works
- [ ] Email verification is sent
- [ ] Media uploads work
- [ ] Chat functionality is operational

## 🎯 Next Steps

1. **Complete the migration**: `npm run migrate`
2. **Test all functionality**: Register, login, post, chat
3. **Configure optional services**: Redis, Cloudinary, OAuth
4. **Enjoy Phase 2 features**: Enhanced performance and scalability!

---

## 📝 Configuration Examples

### Example .env for Development:
```env
POSTGRES_URL=postgresql://sciconnect_user:mypassword@localhost:5432/sciconnect
REDIS_URL=redis://localhost:6379
JWT_SECRET=my-development-jwt-secret-key
JWT_REFRESH_SECRET=my-development-refresh-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=myemail@gmail.com
EMAIL_PASS=myapppassword
EMAIL_FROM=noreply@myapp.com
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Example .env for Production:
```env
POSTGRES_URL=postgresql://user:pass@prod-db.amazonaws.com:5432/sciconnect
REDIS_URL=redis://prod-redis.cache.amazonaws.com:6379
JWT_SECRET=super-secure-production-jwt-secret
JWT_REFRESH_SECRET=super-secure-production-refresh-secret
CLOUDINARY_CLOUD_NAME=my-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=secure-secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://mysciconnectapp.com
```

Ready to migrate? Run `npm run migrate` when you're all set! 🚀 