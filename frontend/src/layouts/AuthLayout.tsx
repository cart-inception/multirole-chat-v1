import { Outlet } from 'react-router-dom';

/**
 * Layout component for authentication pages (login and signup)
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Gemini Chat
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Powered by Google's Gemini AI API
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Child routes rendered here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;