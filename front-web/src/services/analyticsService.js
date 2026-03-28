import api from '../config/api';

export const getAnalyticsData = async () => {
  try {
    const response = await api.get('/api/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};
