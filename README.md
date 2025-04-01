# Multi-RoleAI Chat Application

A full-stack web application that leverages various AI models to provide an interactive chat experience.

## Features

- User authentication (signup, login)
- Persistent conversations
- Real-time AI responses from multiple language models
- Clean, responsive UI

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JSON Web Tokens for authentication
- Multiple AI model integrations

### Frontend
- React
- TypeScript
- Zustand for state management
- React Router for routing
- Tailwind CSS for styling
- Axios for API requests

## Prerequisites

- Node.js (LTS version)
- PostgreSQL database
- API keys for supported AI models

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/multirole_ai_db"
   AI_MODEL_API_KEYS="your-ai-model-api-keys"
   JWT_SECRET="your-secret-key-should-be-long-and-secure"
   PORT=5000
   ```

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env.development` and `.env.production` files:
   ```
   # .env.development
   VITE_API_BASE_URL=http://localhost:5000/api

   # .env.production
   VITE_API_BASE_URL=/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Development Scripts

### Backend

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Compile TypeScript
- `npm run start`: Run production build
- `npm run lint`: Run ESLint

### Frontend

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Production Deployment

For production deployment, follow these steps:

1. Build both frontend and backend:
   ```
   # Backend
   cd backend
   npm run build

   # Frontend
   cd frontend
   npm run build
   ```

2. On your VPS:
   - Install Node.js, PostgreSQL, and Nginx
   - Configure PostgreSQL and create the database
   - Use PM2 to run the backend server
   - Configure Nginx to serve the frontend static files and proxy API requests to the backend

## License

This project is for educational purposes. You may use it as a reference for building similar applications.