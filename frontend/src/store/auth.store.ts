import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AuthApi, { SignupPayload, LoginPayload, AuthResponse } from '../api/auth.api';

// Type for the auth store state
interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginPayload) => Promise<void>;
  signup: (userData: SignupPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadProfile: () => Promise<void>;
}

// Create the auth store with persistence
// Helper function to load initial auth state from localStorage
const loadInitialState = () => {
  const token = localStorage.getItem('token');
  let user = null;
  
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      user = JSON.parse(userJson);
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }
  
  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
  };
};

const initialState = loadInitialState();
console.log('Auth store: initializing with state:', initialState);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state from localStorage
      user: initialState.user,
      token: initialState.token,
      isAuthenticated: initialState.isAuthenticated,
      isLoading: false,
      error: null,
      
      // Login action
      login: async (credentials) => {
        try {
          console.log('Auth store: login action started');
          set({ isLoading: true, error: null });
          
          console.log('Auth store: calling API');
          const response = await AuthApi.login(credentials);
          console.log('Auth store: API response received:', response);
          
          if (!response.data) {
            console.error('Auth store: response.data is missing');
            throw new Error('Invalid response format');
          }
          
          const { user, token } = response.data;
          
          // Store token in localStorage for API interceptors
          localStorage.setItem('token', token);
          console.log('Auth store: token saved to localStorage');
          
          // Store user in localStorage too for persistence
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('Auth store: state updated, user is authenticated');
          
          // Force redirect to chat page
          window.location.href = '/chat';
        } catch (error: any) {
          console.error('Auth store: login error:', error);
          console.error('Auth store: error details:', {
            data: error.response?.data,
            status: error.response?.status,
            message: error.message
          });
          
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          console.log('Auth store: state updated with error:', errorMessage);
          throw new Error(errorMessage);
        }
      },
      
      // Signup action
      signup: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await AuthApi.signup(userData);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Signup failed';
          set({ 
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw new Error(errorMessage);
        }
      },
      
      // Logout action
      logout: () => {
        console.log('Auth store: logging out');
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Redirect to login page
        window.location.href = '/login';
      },
      
      // Clear error action
      clearError: () => {
        set({ error: null });
      },
      
      // Load user profile
      loadProfile: async () => {
        try {
          // Skip if not authenticated or already loading
          if (!get().token || get().isLoading) return;
          
          set({ isLoading: true });
          
          const response = await AuthApi.getProfile();
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false,
            // Only clear user if 401 (handled in API interceptor)
            // Otherwise keep current state
          });
        }
      },
    }),
    {
      name: 'auth-storage', // Storage key
      partialize: (state) => ({ user: state.user, token: state.token }), // Only persist user and token
    }
  )
);

export default useAuthStore;