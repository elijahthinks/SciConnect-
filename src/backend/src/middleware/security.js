const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Rate limiting configurations
const createRateLimiters = (config) => {
  const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: config.rateLimit.authWindowMs,
    max: config.rateLimit.authMax,
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per windowMs
    message: {
      error: 'Too many file uploads, please try again later.',
      retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return { generalLimiter, authLimiter, uploadLimiter };
};

// CORS configuration
const corsOptions = (config) => ({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.frontendUrl,
      config.clientUrl,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
});

// Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
};

// Security middleware setup
const setupSecurity = (app, config) => {
  const { generalLimiter, authLimiter, uploadLimiter } = createRateLimiters(config);

  // Basic security headers
  app.use(helmet(helmetConfig));
  
  // CORS
  app.use(cors(corsOptions(config)));
  
  // Prevent parameter pollution
  app.use(hpp());
  
  // Sanitize data
  app.use(mongoSanitize());
  app.use(xss());
  
  // Rate limiting
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/upload/', uploadLimiter);
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // Trust proxy for production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
};

module.exports = { setupSecurity, createRateLimiters }; 