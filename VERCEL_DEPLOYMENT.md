# SciConnect Vercel Deployment Guide

## 🚀 Deploying SciConnect to Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
3. **Redis**: Use [Upstash](https://upstash.com) or [Redis Cloud](https://redis.com)
4. **Cloudinary**: For file uploads (optional but recommended)

### Step 1: Database Setup

1. **Create PostgreSQL Database**:
   - Sign up for [Neon](https://neon.tech) (free tier available)
   - Create a new project
   - Copy the connection string

2. **Create Redis Instance**:
   - Sign up for [Upstash](https://upstash.com) (free tier available)
   - Create a new Redis database
   - Copy the connection string

### Step 2: Environment Variables

Set these environment variables in Vercel:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Redis
REDIS_URL=redis://username:password@host:port

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
```

### Step 3: Deploy to Vercel

#### Option A: Import from GitHub (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your repository**: `rashireader908/SciConnect-`
4. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Add Environment Variables** (see below)
6. **Deploy!**

#### Option B: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 4: Configure Custom Domain (Optional)

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain

### Step 5: Database Migration

After deployment, run the database migration:

```bash
# Set environment variables locally
export DATABASE_URL="your-postgres-connection-string"

# Run migration
node scripts/migrate-to-postgres.js
```

### Important Notes

⚠️ **Limitations**:
- WebSocket connections won't work on Vercel (serverless functions)
- File uploads should use Cloudinary or similar service
- Session storage should use Redis or database
- Cold starts may affect performance

✅ **Recommendations**:
- Use Cloudinary for file uploads
- Use Upstash Redis for sessions and caching
- Consider using Vercel's Edge Functions for better performance
- Set up proper CORS for your domain

### Troubleshooting

1. **Database Connection Issues**:
   - Check your DATABASE_URL format
   - Ensure SSL is enabled for production databases
   - Verify database credentials

2. **Build Errors**:
   - Check that all dependencies are in package.json
   - Ensure Node.js version is compatible (14+)

3. **API Errors**:
   - Check Vercel function logs
   - Verify environment variables are set correctly
   - Test database connection

### Alternative Deployment Options

If you need WebSocket support or better performance:

1. **Railway**: Full-stack deployment with WebSocket support
2. **Render**: Good for full-stack applications
3. **DigitalOcean App Platform**: Scalable and reliable

### Support

For issues specific to Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions) 