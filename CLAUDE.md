# CLAUDE.md - Development Guidelines

## Build/Lint/Test Commands
```
# Backend (Node.js/Express)
npm run build       # Compile TypeScript
npm run start       # Run production build
npm run dev         # Run with hot-reload
npm run lint        # Run ESLint
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm test -- -t "test name"  # Run specific test

# Frontend (React)
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run test        # Run all tests
```

## Code Style Guidelines
- **TypeScript**: Strict mode enabled. Use explicit types, avoid `any`
- **Formatting**: Follow Prettier defaults, 2-space indentation
- **Imports**: Group in order: external libs, internal modules, types. No unused imports
- **Components**: Functional components with TypeScript props interface
- **State Management**: Zustand for global state, React hooks for local state
- **Naming**: camelCase for variables/functions, PascalCase for components/classes/interfaces
- **Error Handling**: Use try/catch with specific error types. Log errors with context
- **Backend Structure**: Follow controller-service-repository pattern
- **API Endpoints**: RESTful conventions, consistent error responses
- **Database**: Use Prisma models and migrations. UUID for IDs