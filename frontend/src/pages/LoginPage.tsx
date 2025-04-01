import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { ArrowLeftRight } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <ArrowLeftRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue to Gemini Chat
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                New to Gemini Chat?
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/signup"
              className="w-full flex justify-center py-2 px-4 border border-indigo-600 dark:border-indigo-500 rounded-md shadow-sm text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-transparent hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Gemini Chat. All rights reserved.
        </p>
        <p className="mt-1">
          Powered by Google's Gemini API
        </p>
      </div>
    </div>
  );
};

export default LoginPage;