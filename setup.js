#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 SciConnect Platform Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file with default values...');
  
  const envContent = `# SciConnect Environment Configuration
NODE_ENV=development

# Server Configuration
PORT=3000

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
JWT_REFRESH_SECRET=${crypto.randomBytes(32).toString('hex')}

# Database Configuration
DATABASE_URL=sqlite:./database.sqlite
POSTGRES_URL=postgresql://username:password@localhost:5432/sciconnect
REDIS_URL=redis://localhost:6379

# OAuth Configuration (Optional - set these for OAuth login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Email Configuration (Optional - set these for email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@sciconnect.com

# Cloudinary Configuration (Optional - set these for cloud file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

// Check for required directories
const requiredDirs = [
  'uploads',
  'uploads/avatars',
  'uploads/images',
  'uploads/videos',
  'uploads/documents',
  'uploads/chat'
];

console.log('\n📁 Checking upload directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Check if frontend is built
const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
if (!fs.existsSync(frontendDistPath)) {
  console.log('\n🏗️  Building frontend...');
  const { execSync } = require('child_process');
  try {
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully!');
  } catch (error) {
    console.log('❌ Frontend build failed. Please run: cd frontend && npm run build');
  }
} else {
  console.log('\n✅ Frontend build exists');
}

// Check database
const dbPath = path.join(__dirname, 'database.sqlite');
if (!fs.existsSync(dbPath)) {
  console.log('\n💾 Database file not found. It will be created when you start the server.');
} else {
  console.log('\n✅ Database file exists');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your actual configuration values');
console.log('2. Run "npm run dev" to start the backend server');
console.log('3. Run "cd frontend && npm run dev" to start the frontend');
console.log('4. Visit http://localhost:3000 to access your platform');
console.log('\n🔧 Optional configurations:');
console.log('- Set up OAuth (Google/Facebook) for social login');
console.log('- Configure email service for verification emails');
console.log('- Set up Cloudinary for cloud file storage');
console.log('- Configure PostgreSQL for production use'); 