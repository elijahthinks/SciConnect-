require('dotenv').config();

module.exports = {
  development: {
    clientUrls: ['http://localhost:5173', 'http://localhost:5174'],
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    database: {
      url: process.env.DATABASE_URL || 'sqlite:./database.sqlite',
      postgres: process.env.POSTGRES_URL,
      redis: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },
      facebook: {
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/facebook/callback'
      }
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      from: process.env.EMAIL_FROM || 'noreply@sciconnect.com'
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      authWindowMs: 15 * 60 * 1000, // 15 minutes
      authMax: 50 // increased limit for development testing
    }
  },
  production: {
    clientUrl: process.env.CLIENT_URL || 'https://sciconnect.com',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    database: {
      url: process.env.DATABASE_URL,
      postgres: process.env.POSTGRES_URL,
      redis: process.env.REDIS_URL
    },
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },
      facebook: {
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/facebook/callback'
      }
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      from: process.env.EMAIL_FROM
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    frontendUrl: process.env.FRONTEND_URL || 'https://sciconnect.com',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // higher limit for production
      authWindowMs: 15 * 60 * 1000, // 15 minutes
      authMax: 10 // slightly higher auth limit for production
    }
  }
}; 