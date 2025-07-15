#!/bin/bash

# SciConnect Vercel Deployment Script

echo "🚀 Starting SciConnect Vercel Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set up your environment variables in Vercel dashboard"
echo "   2. Configure your database (PostgreSQL)"
echo "   3. Set up Redis for sessions"
echo "   4. Configure Cloudinary for file uploads"
echo ""
echo "📖 See VERCEL_DEPLOYMENT.md for detailed instructions" 