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
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Login action
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await AuthApi.login(credentials);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
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
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
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