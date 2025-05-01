import api from './index';

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed. Please try again.' };
    }
  },

  signup: async (name, email, password, phone) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, phone });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed. Please try again.' };
    }
  },

  adminLogin: async (email, password, adminCode) => {
    try {
      const response = await api.post('/auth/admin-login', { email, password, adminCode });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Admin login failed. Please try again.' };
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token verification failed.' };
    }
  },
};
