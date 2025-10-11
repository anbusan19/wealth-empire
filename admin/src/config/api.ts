// Admin API Configuration
const API_BASE_URL = 'https://api-wealthempires.vercel.app';

export const ADMIN_API_ENDPOINTS = {
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  RECENT_USERS: `${API_BASE_URL}/api/admin/users/recent`,
  RECENT_HEALTH_CHECKS: `${API_BASE_URL}/api/admin/health-checks/recent`,

  // User Management
  USERS_LIST: `${API_BASE_URL}/api/admin/users`,
  USER_DETAIL: (userId: string) => `${API_BASE_URL}/api/admin/users/${userId}`,

  // Reports
  REPORTS: `${API_BASE_URL}/api/admin/reports`,
  REPORT_DETAIL: (userId: string, reportId: string) => `${API_BASE_URL}/api/admin/reports/${userId}/${reportId}`,

  // System Health
  HEALTH: `${API_BASE_URL}/api/health`
};

// API Helper functions
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    // Get auth token from localStorage for admin requests
    const authData = localStorage.getItem('adminAuth');
    let authHeaders = {};
    
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.expires > Date.now() && parsed.token) {
          authHeaders = {
            'Authorization': `Bearer ${parsed.token}`
          };
        }
      } catch (error) {
        console.warn('Failed to parse admin auth data:', error);
      }
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_BASE_URL;