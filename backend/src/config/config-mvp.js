require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration (SQLite for MVP)
  database: {
    dialect: 'sqlite',
    storage: process.env.DB_PATH || './database/worksync-ai.db',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-mvp-demo',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // AI Services Configuration
  aiServices: {
    baseUrl: process.env.AI_SERVICES_URL || 'http://localhost:5000',
    timeout: 10000
  },
  
  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10, // Reduced for MVP
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      'http://localhost:3000', 
      'http://localhost:5173' // Vite default port
    ],
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Simple validation for required variables
if (!config.jwt.secret || config.jwt.secret === 'your-super-secret-jwt-key-for-mvp-demo') {
  console.warn('⚠️  Using default JWT secret. Please set JWT_SECRET environment variable for production!');
}

module.exports = config;