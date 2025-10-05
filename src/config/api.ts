// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Authentication
  FIREBASE_AUTH: `${API_BASE_URL}/api/auth/firebase-auth`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Onboarding
  ONBOARDING_COMPLETE: `${API_BASE_URL}/api/onboarding/complete`,
  ONBOARDING_STATUS: `${API_BASE_URL}/api/onboarding/status`,
  ONBOARDING_UPDATE: `${API_BASE_URL}/api/onboarding/update`,
  
  // Health Check
  HEALTH_CHECK_SAVE: `${API_BASE_URL}/api/health-check/save-results`,
  HEALTH_CHECK_HISTORY: `${API_BASE_URL}/api/health-check/history`,
  HEALTH_CHECK_LATEST: `${API_BASE_URL}/api/health-check/latest`,
  
  // Users
  USER_DASHBOARD: `${API_BASE_URL}/api/users/dashboard`,
  USER_SUBSCRIPTION: `${API_BASE_URL}/api/users/subscription`,
  
  // External APIs
  COMPANY_DATA: (cin: string) => `${API_BASE_URL}/api/company/${cin}`,
  
  // Health Check
  HEALTH: `${API_BASE_URL}/api/health`
};

export default API_BASE_URL;