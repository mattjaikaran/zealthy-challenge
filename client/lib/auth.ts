import { api } from './axios';
import { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface ErrorResponse {
  message?: string;
  detail?: string;
}

class AuthService {
  private static TOKEN_KEY = 'auth_token';

  static setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', data);
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', data);
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  static async logout() {
    try {
      // Optionally call logout endpoint if your backend requires it
      // await api.post('/auth/logout')
      this.removeToken();
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          this.removeToken();
          return null;
        }
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message;
        throw new Error(errorMessage);
      }
      this.removeToken();
      return null;
    }
  }

  static getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
