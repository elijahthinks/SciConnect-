require('dotenv').config();

module.exports = {
  development: {
    clientUrls: ['http://localhost:5173', 'http://localhost:5174'],
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
  },
  production: {
    clientUrl: process.env.CLIENT_URL || 'https://sciconnect.com',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET
  }
}; 