import api from './index';

export const adminApi = {
  // Dashboard
  getDashboardData: async (timeframe = 'week') => {
    try {
      const response = await api.get(`/admin/dashboard?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard data' };
    }
  },

  // Content Moderation
  getItemsForModeration: async (status = 'all', sortBy = 'date') => {
    try {
      const response = await api.get(`/admin/moderation/items?status=${status}&sortBy=${sortBy}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch items for moderation' };
    }
  },

  getModerationRules: async () => {
    try {
      const response = await api.get('/admin/moderation/rules');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch moderation rules' };
    }
  },

  batchModerateItems: async (itemIds, action) => {
    try {
      const response = await api.post('/admin/moderation/batch', { itemIds, action });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: `Failed to ${action} items` };
    }
  },

  // Dispute Resolution
  getDisputes: async (status = 'all', sortBy = 'date') => {
    try {
      const response = await api.get(`/admin/disputes?status=${status}&sortBy=${sortBy}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch disputes' };
    }
  },

  getDisputeById: async id => {
    try {
      const response = await api.get(`/admin/disputes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dispute details' };
    }
  },

  updateDisputeStatus: async (id, status, notes) => {
    try {
      const response = await api.patch(`/admin/disputes/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update dispute status' };
    }
  },

  getAIRecommendation: async disputeId => {
    try {
      const response = await api.get(`/admin/disputes/${disputeId}/ai-recommendation`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get AI recommendation' };
    }
  },

  // Reports
  generateReport: async (type, filters) => {
    try {
      const response = await api.post('/admin/reports', { type, filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate report' };
    }
  },

  // Admin Profile
  getAdminPerformance: async () => {
    try {
      const response = await api.get('/admin/performance');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch admin performance data' };
    }
  },
};
