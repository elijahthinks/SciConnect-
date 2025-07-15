# 🚀 Quick PostgreSQL Setup - Option 3

## Step 1: Get Free PostgreSQL Database (2 minutes)
1. Go to **Neon**: https://neon.tech
2. Sign up with GitHub/Google account
3. Create database:
   - Database name: `sciconnect`
   - Region: Choose closest to you
   - Click "Create Database"

## Step 2: Get Connection String
1. In Neon dashboard, click "Connection String"
2. Copy the **connection string** (looks like):
   ```
   postgresql://user:password@host:port/sciconnect?sslmode=require
   ```

## Step 3: Update .env File
1. Open your `.env` file
2. Replace this line:
   ```
   POSTGRES_URL=
   ```
   With your connection string:
   ```
   POSTGRES_URL=postgresql://user:password@host:port/sciconnect?sslmode=require
   ```

## Step 4: Migrate Data
Run these commands in order:
```bash
# 1. Install dependencies (if not done)
npm install

# 2. Migrate your SQLite data to PostgreSQL
npm run migrate

# 3. Start the server
npm start
```

## Step 5: Test Your Website
1. Open: http://localhost:3000
2. Try creating a new account
3. Try logging in

## 🎉 You're Done!
Your SciConnect app is now running with PostgreSQL in the cloud!

## Alternative: Local PostgreSQL
If you prefer local installation:
```bash
# Install PostgreSQL via Homebrew (if you have it)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb sciconnect

# Update .env
POSTGRES_URL=postgresql://localhost:5432/sciconnect
``` 