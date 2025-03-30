Detailed Structure Guide for AI Agent: Gemini Web App (JS/TS & VPS)Objective: Generate code for a web application using the Google Gemini API, based on the following structure and specifications.Core Requirements:Full-stack JavaScript/TypeScript application.Node.js/Express backend.React frontend.PostgreSQL database.User authentication (signup/login) with JWT.Persistent storage of user accounts and conversation history.Interaction with Google Gemini API via official SDK.Initial deployment target: VPS.Capable of handling ~8 concurrent users.Assumptions:Node.js (LTS version) and npm/yarn are installed.Access to a PostgreSQL database instance (details provided via environment variables).Google Gemini API Key available.VPS environment access for deployment steps.1. Overall Architecture: Client-ServerClient (Frontend): React (TypeScript) application running in the browser.Server (Backend): Node.js (TypeScript) application using Express, running on the VPS.Database: PostgreSQL instance, running on the VPS.External API: Google Gemini API.Communication Flow:Frontend sends HTTP requests (e.g., login, send message) to Backend API endpoints.Backend processes requests, interacts with Database (via ORM like Prisma) and Gemini API (via @google/generative-ai SDK).Backend sends HTTP responses (e.g., user data, chat messages, errors) back to Frontend.2. Backend Structure (Node.js / Express / TypeScript / Prisma)Initialize Project:# mkdir backend && cd backend
# npm init -y
# npm install typescript @types/node @types/express ts-node-dev --save-dev
# npm install express dotenv cors helmet morgan bcryptjs jsonwebtoken @prisma/client @google/generative-ai zod
# npx tsc --init # Configure tsconfig.json (target: ES2016+, module: CommonJS, outDir: ./dist, rootDir: ./src, strict: true, esModuleInterop: true)
# npx prisma init --datasource-provider postgresql
Directory Structure:/backend
|-- /prisma               # Prisma schema and migrations
|   `-- schema.prisma
|-- /src                  # TypeScript source code
|   |-- /config           # Load and export environment variables (using dotenv)
|   |   `-- index.ts
|   |-- /controllers      # Express route handlers (parse request, call service, send response)
|   |   |-- auth.controller.ts
|   |   `-- chat.controller.ts
|   |-- /dtos             # Data Transfer Objects (define request body shapes using Zod)
|   |   |-- auth.dto.ts
|   |   `-- chat.dto.ts
|   |-- /middleware       # Express middleware functions
|   |   |-- auth.middleware.ts  # Verify JWT
|   |   |-- error.middleware.ts # Global error handler
|   |   `-- validate.middleware.ts # Validate request body using Zod DTOs
|   |-- /models           # (Managed by Prisma - defined in schema.prisma)
|   |-- /routes           # Define API endpoints and link to controllers/middleware
|   |   |-- index.ts      # Main router combining other routes
|   |   |-- auth.routes.ts
|   |   `-- chat.routes.ts
|   |-- /services         # Core business logic
|   |   |-- auth.service.ts   # User signup, login logic (use bcryptjs, jsonwebtoken)
|   |   |-- chat.service.ts   # Manage conversations/messages, call GeminiService
|   |   `-- gemini.service.ts # Interact with Gemini API SDK (@google/generative-ai)
|   |-- /utils            # Utility functions (e.g., logger)
|   |-- app.ts            # Express app initialization, middleware registration, route mounting
|   `-- server.ts         # HTTP server startup logic
|-- .env                  # Environment variables (DATABASE_URL, GEMINI_API_KEY, JWT_SECRET, PORT)
|-- .gitignore
|-- package.json
|-- tsconfig.json
Key Implementation Points:prisma/schema.prisma: Define User, Conversation, Message models as specified in Section 4. Run npx prisma migrate dev to sync DB..env: Define DATABASE_URL, GEMINI_API_KEY, JWT_SECRET (a strong random string), PORT (e.g., 5000).config/index.ts: Load variables from .env using dotenv.dtos/*.dto.ts: Use zod to define schemas for request validation (e.g., SignupDto, LoginDto, CreateMessageDto).middleware/validate.middleware.ts: Create middleware that uses Zod schemas to validate req.body.middleware/auth.middleware.ts: Verify Authorization: Bearer <token> header using jsonwebtoken. Attach user info (id) to req.services/auth.service.ts: Use bcryptjs.hash for signup, bcryptjs.compare for login. Use jsonwebtoken.sign to create tokens, jsonwebtoken.verify in middleware.services/gemini.service.ts: Initialize Gemini client (new GoogleGenerativeAI(API_KEY)). Implement function to send prompts (potentially including history for context) and return AI response. Handle potential API errors.services/chat.service.ts: Use Prisma client (new PrismaClient()) to interact with DB (create/fetch conversations/messages). Ensure messages are linked to users and conversations correctly. Pass necessary context to GeminiService.controllers/*: Keep controllers thin. Call services, handle responses (success/error).routes/*: Apply authMiddleware to protected chat routes. Use validateMiddleware for routes expecting request bodies.app.ts: Use cors(), helmet(), morgan('dev'), express.json(). Mount main router. Apply global errorMiddleware last.3. Frontend Structure (React / TypeScript / Vite)Initialize Project:# npm create vite@latest frontend -- --template react-ts
# cd frontend
# npm install axios react-router-dom zustand @tailwindcss/forms lucide-react tailwindcss postcss autoprefixer
# npx tailwindcss init -p # Configure tailwind.config.js and postcss.config.js
# # Configure main.css for Tailwind directives (@tailwind base; @tailwind components; @tailwind utilities;)
Directory Structure:/frontend
|-- /public             # Static assets
|-- /src                # Application source code
|   |-- /api              # Axios instances and functions for backend calls
|   |   |-- index.ts      # Base Axios setup (baseURL from env)
|   |   |-- auth.api.ts
|   |   `-- chat.api.ts
|   |-- /assets           # Images, etc.
|   |-- /components       # Reusable UI components
|   |   |-- /ui           # Generic components (Button, Input, Spinner, Alert)
|   |   |-- /auth         # LoginForm, SignupForm
|   |   `-- /chat         # ChatInput, ChatHistory, MessageBubble, ConversationList
|   |-- /hooks            # Custom React Hooks (e.g., useAuth)
|   |-- /layouts          # Layout components (e.g., AuthLayout, MainLayout with sidebar/header)
|   |-- /pages            # Top-level view components mapped to routes
|   |   |-- LoginPage.tsx
|   |   |-- SignupPage.tsx
|   |   `-- ChatPage.tsx
|   |-- /router           # Routing configuration
|   |   |-- index.tsx     # Define routes using react-router-dom
|   |   `-- ProtectedRoute.tsx # Component to guard authenticated routes
|   |-- /store            # Global state management using Zustand
|   |   |-- auth.store.ts # Auth state (user, token), login/logout actions
|   |   `-- chat.store.ts # Chat state (conversations, messages, loading)
|   |-- /styles           # Global CSS, Tailwind base styles (main.css)
|   |-- /utils            # Helper functions
|   |-- App.tsx           # Main component, sets up RouterProvider
|   `-- main.tsx          # Entry point, renders App
|-- .env.development    # Frontend env vars (e.g., VITE_API_BASE_URL=http://localhost:5000/api)
|-- .env.production     # Frontend env vars (e.g., VITE_API_BASE_URL=https://yourdomain.com/api)
|-- .gitignore
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- tsconfig.json
|-- vite.config.ts
Key Implementation Points:.env.*: Define VITE_API_BASE_URL pointing to the backend API URL.api/index.ts: Configure Axios base instance, including interceptors to add JWT Authorization header for authenticated requests.store/auth.store.ts: Use Zustand to manage user state and token. Persist token to localStorage. Actions for login, signup, logout.router/ProtectedRoute.tsx: Check auth state from Zustand store; redirect to /login if not authenticated.router/index.tsx: Define routes using createBrowserRouter, wrap protected routes with ProtectedRoute.pages/LoginPage.tsx, pages/SignupPage.tsx: Use components from components/auth, call API functions from api/auth.api.ts, interact with auth.store.ts on success.pages/ChatPage.tsx: Fetch conversations/messages using api/chat.api.ts. Use components from components/chat. Handle message submission, update state via chat.store.ts. Display loading indicators.Styling: Use Tailwind CSS utility classes extensively for styling components. Use lucide-react for icons.4. Database Schema (PostgreSQL - Prisma Definition)// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Comes from .env file
}

model User {
  id            String    @id @default(uuid())
  username      String    @unique
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  conversations Conversation[]
}

model Conversation {
  id        String    @id @default(uuid())
  userId    String
  title     String?   // Optional title
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
}

enum SenderType {
  USER
  AI
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  senderType     SenderType // 'USER' or 'AI'
  content        String       @db.Text // Use TEXT for potentially long content
  timestamp      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
Use UUIDs for primary keys.Establish clear relations with onDelete: Cascade where appropriate (deleting a user deletes their conversations; deleting a conversation deletes its messages).5. High-Level Development Steps (Sequence for AI Agent)Backend Setup: Execute initialization commands, configure tsconfig.json, setup .env.Database Modeling: Define schema in prisma/schema.prisma. Run npx prisma migrate dev --name init to create tables.Backend Auth Implementation: Create User model logic (handled by Prisma), auth.dto.ts, auth.service.ts (hashing, JWT), auth.controller.ts, auth.routes.ts, and auth.middleware.ts.Backend Chat Implementation: Create Conversation, Message logic (Prisma), chat.dto.ts, gemini.service.ts (integrate SDK), chat.service.ts (DB ops + call Gemini), chat.controller.ts, chat.routes.ts. Secure routes.Backend Core: Implement config, app.ts, server.ts, error handling, utility functions.Frontend Setup: Execute initialization commands, configure Tailwind, setup .env.*.Frontend State & Routing: Implement Zustand stores (auth.store.ts, chat.store.ts), setup router (router/index.tsx, ProtectedRoute.tsx), create basic layouts.Frontend API Layer: Implement Axios setup and API call functions (api/*).Frontend Auth UI: Build LoginPage, SignupPage and associated components (components/auth, components/ui). Connect to API and state store.Frontend Chat UI: Build ChatPage and associated components (components/chat).Frontend Chat Logic: Connect Chat UI to API (api/chat.api.ts) and state store (chat.store.ts). Handle message sending/receiving, history display, loading states.Styling & Refinement: Apply Tailwind classes thoroughly for UI consistency and responsiveness.Testing (Conceptual): Add unit tests for services (esp. auth, Gemini interaction) and critical frontend logic (state stores, hooks).VPS Deployment Steps (Manual / Scripted):Install Node.js, PostgreSQL, Nginx on VPS.Configure PostgreSQL (create user/database).Clone repository to VPS.Backend: npm install, set environment variables (system level or .env), run npx prisma migrate deploy, run npm run build (if using TS compilation), start server using pm2 start dist/server.js.Frontend: npm install, set environment variables (.env.production), run npm run build, copy dist contents to Nginx web root.Configure Nginx: Set up server block, reverse proxy requests to /api to the backend Node.js app (running on localhost:PORT), serve frontend static files.Configure Firewall (e.g., ufw).(Optional) Configure HTTPS with Let's Encrypt.6. ConclusionThis detailed guide provides specific instructions and structure for an AI agent to generate the Gemini web application. Follow the steps sequentially, ensuring each component interacts correctly with the others.