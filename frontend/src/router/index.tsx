import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute, { AuthRoute } from './ProtectedRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Use lazy loading for page components to improve initial load time
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthRoute />,
    children: [
      {
        path: '/',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: 'signup',
            element: (
              <Suspense fallback={<PageLoader />}>
                <SignupPage />
              </Suspense>
            ),
          },
          // Redirect root to login
          {
            path: '',
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            path: 'chat',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ChatPage />
              </Suspense>
            ),
          },
          {
            path: 'chat/:conversationId',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ChatPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

// Router component
const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;