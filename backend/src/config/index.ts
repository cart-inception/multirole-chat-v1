import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Define configuration object with required variables
const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-not-secure',
    expiresIn: '24h', // Token validity period
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // Allow any origin in development
  },
};

// Validate that required environment variables are set
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables in your .env file.');
  // We're allowing the app to start in dev mode with warnings, but in production you might want to exit
  // process.exit(1);
}

export default config;