import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const SignupForm = () => {
  const { signup, isLoading, error, clearError } = useAuthStore();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    
    // Validate username
    if (!formData.username) {
      newErrors.username = 'Username is required';
      valid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      valid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
      valid = false;
    }
    
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Submit only username, email, and password (not confirmPassword)
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
    } catch (error) {
      // Error handling is done in the store
      console.error('Signup failed', error);
    }
  };
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <Alert type="error" message={error} onClose={clearError} />
      )}
      
      <div>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          label="Username"
          value={formData.username}
          onChange={handleChange}
          error={formErrors.username}
        />
      </div>
      
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
          autoComplete="new-password"
          required
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
        />
      </div>
      
      <div>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
        />
      </div>
      
      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Sign up
        </Button>
      </div>
      
      <div className="text-sm text-center">
        <span className="text-gray-500">Already have an account? </span>
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;