import axios, { AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { EXPO_PUBLIC_API_URL } from '@env';

// Determine the correct API URL based on platform
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api'; // Android emulator
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5001/api'; // iOS simulator
  }
  return EXPO_PUBLIC_API_URL || 'http://localhost:5001/api'; // Fallback
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

// Define error response type
interface ErrorResponse {
  message?: string;
  error?: string;
  data?: {
    message?: string;
    error?: string;
  };
}

// Create axios instance with base URL and timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Add response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Response interceptor error:', error);

    if (!error.response) {
      return Promise.reject(new Error('Network error: Could not connect to server'));
    }

    return Promise.reject(error);
  },
);

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
    isAdmin: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isAdmin: boolean;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post<AuthResponse>('/auth/login', { email, password });

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error: unknown) {
      console.error('Login API error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        response:
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: any } }).response?.data
            : undefined,
      });

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new Error('Network error: Could not connect to server');
        }

        const status = error.response.status;
        const errorData = error.response.data as ErrorResponse;
        const message = errorData?.message || errorData?.error || 'Login failed';

        switch (status) {
          case 401:
            throw new Error('Invalid email or password');
          case 404:
            throw new Error('User not found');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(message);
        }
      }

      throw new Error('An unexpected error occurred. Please try again.');
    }
  },

  signup: async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<{ token: string; user: User }> => {
    try {
      console.log('Attempting signup for:', email);
      const response = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
        phone,
      });

      console.log('Signup response:', response.data);

      if (!response || !response.data) {
        throw new Error('No response from server');
      }

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Invalid response format from server');
      }

      const transformedUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        isAdmin: userData.isAdmin,
      };

      await AsyncStorage.setItem('token', token);

      return { token, user: transformedUser };
    } catch (error) {
      console.error('Signup error:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (!axiosError.response) {
          throw new Error('Network error. Please check your connection.');
        }

        const errorData = axiosError.response.data;
        const errorMessage = errorData?.message || errorData?.error;
        throw new Error(errorMessage || 'Failed to sign up. Please try again.');
      }

      throw new Error('Failed to sign up. Please try again.');
    }
  },

  adminLogin: async (
    email: string,
    password: string,
    adminCode: string,
  ): Promise<{ token: string; user: User }> => {
    try {
      console.log('Attempting admin login for:', email);
      const response = await api.post<AuthResponse>('/auth/admin-login', {
        email,
        password,
        adminCode,
      });

      console.log('Admin login response:', response.data);

      if (!response || !response.data) {
        throw new Error('No response from server');
      }

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Invalid response format from server');
      }

      const transformedUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        isAdmin: userData.isAdmin,
      };

      await AsyncStorage.setItem('token', token);

      return { token, user: transformedUser };
    } catch (error) {
      console.error('Admin login error:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;

        if (!axiosError.response) {
          throw new Error('Network error. Please check your connection.');
        }

        const errorData = axiosError.response.data;
        const errorMessage = errorData?.message || errorData?.error;
        throw new Error(errorMessage || 'Failed to login as admin. Please try again.');
      }

      throw new Error('Failed to login as admin. Please try again.');
    }
  },

  async getAIAssistantResponse(message: string): Promise<{ message: string }> {
    try {
      const response = await axios.post<{ message: string }>(`${API_URL}/ai/chat`, { message });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ErrorResponse;
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(errorData?.message || errorData?.error || 'Failed to get AI response');
      }
      throw new Error('Network error occurred');
    }
  },
};
