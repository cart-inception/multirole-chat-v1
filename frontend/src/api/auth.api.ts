import api from './index';

// Types for request payloads
export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Types for responses
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

// Auth API service
const AuthApi = {
  // Register a new user
  signup: async (data: SignupPayload) => {
    const response = await api.post<{ success: boolean; message: string; data: AuthResponse }>(
      '/auth/signup',
      data
    );
    return response.data;
  },
  
  // Login with email and password
  login: async (data: LoginPayload) => {
    const response = await api.post<{ success: boolean; message: string; data: AuthResponse }>(
      '/auth/login',
      data
    );
    return response.data;
  },
  
  // Get current user profile
  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: AuthResponse['user'] }>(
      '/auth/profile'
    );
    return response.data;
  },
};

export default AuthApi;