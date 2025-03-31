import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuthStore();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous error
    clearError();
    
    // Validate form
    if (!validateForm()) return;
    
    try {
      // Attempt login
      await login(formData);
    } catch (error) {
      // Error handling is done in the store
      console.error('Login failed', error);
    }
  };
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <Alert type="error" message={error} onClose={clearError} />
      )}
      
      <div>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email address"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
        />
      </div>
      
      <div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
        />
      </div>
      
      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
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
    </form>
  );
};

export default LoginForm;