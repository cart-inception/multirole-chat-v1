import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import config from './config';

// Create Express application
const app: Express = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON request bodies

// Mount API routes
app.use('/api', routes);

// Default route for the API root
app.get('/', (req, res) => {
  res.json({
    message: 'Gemini Chat API',
    version: '1.0.0',
  });
});

// Apply global error handler
app.use(errorMiddleware);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;