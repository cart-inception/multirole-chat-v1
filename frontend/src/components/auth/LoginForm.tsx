import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  // Fixed test credentials for quick login
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Password123!');
  const [message, setMessage] = useState('');
  
  // Update debug area in sidebar
  const updateDebug = (debugMessage: string) => {
    const debugContainer = document.getElementById('debug-container');
    if (debugContainer) {
      debugContainer.innerHTML = debugMessage;
    }
  };
  
  // Check if already authenticated
  useEffect(() => {
    updateDebug(`Checking authentication state: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
    if (isAuthenticated) {
      updateDebug('User is already authenticated, redirecting to /chat');
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle direct login with fixed credentials (for testing)
  const handleDirectLogin = () => {
    setMessage("Attempting direct login...");
    updateDebug(`Direct login with: ${email}`);
    
    // Manual localStorage approach to avoid potential issues with the store
    fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(response => {
        updateDebug(`Login response status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`Login failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        updateDebug(`Login successful: ${JSON.stringify(data.data.user.username)}`);
        setMessage("Login successful! Redirecting...");
        
        // Store auth data in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Force page reload to apply authentication
        setTimeout(() => {
          window.location.href = '/chat';
        }, 1000);
      })
      .catch(err => {
        updateDebug(`Login error: ${err.message}`);
        setMessage(`Login failed: ${err.message}`);
      });
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} onClose={clearError} />
      )}
      
      {message && (
        <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">
          {message}
        </div>
      )}
      
      <div>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div>
        <Button
          type="button" // Changed to button type to disable form submission
          variant="primary"
          fullWidth
          isLoading={isLoading}
          onClick={handleDirectLogin}
        >
          Sign in
        </Button>
      </div>
      
      <div className="text-sm text-center">
        <span className="text-gray-500">Don't have an account? </span>
        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;