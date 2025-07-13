import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
  } = useAuthStore();

  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Check for existing token on app load (only once)
    const checkAuth = async () => {
      if (hasCheckedAuth.current || isLoading) {return;}
      
      setLoading(true);
      hasCheckedAuth.current = true;
      
      try {
        const storedToken = localStorage.getItem('auth-storage');
        if (storedToken) {
          const parsed = JSON.parse(storedToken);
          if (parsed.state?.token) {
            // Only verify token if we don't have user data
            if (!user) {
              const response = await authApi.getProfile();
              if (response.success && response.data?.user) {
                storeLogin(response.data.user, parsed.state.token);
              } else {
                // Token is invalid, clear it
                localStorage.removeItem('auth-storage');
                storeLogout();
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('auth-storage');
        storeLogout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [storeLogin, storeLogout, setLoading, user, isLoading]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        const { user: userData, token: newToken } = response.data;
        storeLogin(userData, newToken);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}; 