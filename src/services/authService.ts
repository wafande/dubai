import { User } from '../types/user';
import { apiService } from './api';

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  phone?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'dubai_charter_token';
  private readonly USER_KEY = 'dubai_charter_current_user';
  private readonly API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  constructor() {
    // Initialize auth state from localStorage
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.setAuthState({ user, token });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        this.clearAuth();
      }
    }
  }

  private setAuthState(auth: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, auth.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Use apiService instead of direct fetch
      const response = await apiService.login(credentials.email, credentials.password);
      
      // Validate that user object has required fields including role
      if (!response.user || !response.user.id || !response.user.role) {
        console.error('Invalid user data:', response);
        throw new Error('Invalid user data received from server');
      }

      // Store the complete user object including role
      this.setAuthState(response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Server is not responding. Please try again in a few moments.');
        }
        if (error.message.includes('Network error')) {
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }
        throw error;
      }
      
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const auth: AuthResponse = await response.json();
      this.setAuthState(auth);
      return auth;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string | null> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      const response = await fetch(`${this.API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token: newToken } = await response.json();
      localStorage.setItem(this.TOKEN_KEY, newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuth();
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.API_URL}/api/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/api/auth/password/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request password reset');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/api/auth/password/reset/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  }
}

export const authService = new AuthService(); 