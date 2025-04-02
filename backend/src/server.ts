import app from './app';
import config from './config';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Get port from environment or use default
const port = config.port;

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
  console.log(`Health check available at: http://0.0.0.0:${port}/api/health`);
  console.log(`API available at: http://0.0.0.0:${port}/api`);
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Close the database connection
  await prisma.$disconnect();
  
  // Close the server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close if it takes too long
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default server;