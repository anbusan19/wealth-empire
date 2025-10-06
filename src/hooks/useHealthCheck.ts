import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface HealthCheckResult {
  assessmentDate: string;
  answers: Record<number, string>;
  score: number;
  recommendations: string[];
  followUpAnswers: Record<number, string>;
}

interface HealthCheckStats {
  totalAssessments: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  lastAssessment: string | null;
  trend: 'improving' | 'declining' | 'stable' | 'no-data';
}

interface HealthCheckHistory {
  assessmentDate: string;
  score: number;
  recommendations: string[];
  answersCount: number;
  followUpAnswersCount: number;
}

export const useHealthCheck = () => {
  const { currentUser, getIdToken } = useAuth();
  const [latestResult, setLatestResult] = useState<HealthCheckResult | null>(null);
  const [stats, setStats] = useState<HealthCheckStats>({
    totalAssessments: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    lastAssessment: null,
    trend: 'no-data'
  });
  const [history, setHistory] = useState<HealthCheckHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestResult = async () => {
    if (!currentUser) {
      setLatestResult(null);
      return;
    }
    
    try {
      setLoading(true);
      const token = await getIdToken();
      
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.HEALTH_CHECK_LATEST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLatestResult(data.data.result);
        setError(null);
      } else if (response.status === 404) {
        setLatestResult(null); // No results found - this is normal for new users
        setError(null);
      } else if (response.status === 401) {
        console.error('Authentication failed for health check request');
        setLatestResult(null);
      } else {
        console.error('Failed to fetch latest health check:', response.status);
      }
    } catch (error) {
      console.error('Error fetching latest health check:', error);
      setLatestResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!currentUser) {
      return;
    }
    
    try {
      const token = await getIdToken();
      
      if (!token) {
        console.error('No authentication token available for stats');
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.HEALTH_CHECK_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
        setError(null);
      } else if (response.status === 404) {
        // No stats available yet - keep default values
        setError(null);
      } else if (response.status === 401) {
        console.error('Authentication failed for health check stats');
      } else {
        console.error('Failed to fetch health check stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching health check stats:', error);
    }
  };

  const fetchHistory = async (limit = 10, page = 1) => {
    if (!currentUser) {
      setHistory([]);
      return;
    }
    
    try {
      const token = await getIdToken();
      
      if (!token) {
        console.error('No authentication token available for history');
        return;
      }
      
      const response = await fetch(`${API_ENDPOINTS.HEALTH_CHECK_HISTORY}?limit=${limit}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data.history);
        setError(null);
      } else if (response.status === 404) {
        setHistory([]); // No history available yet
        setError(null);
      } else if (response.status === 401) {
        console.error('Authentication failed for health check history');
        setHistory([]);
      } else {
        console.error('Failed to fetch health check history:', response.status);
      }
    } catch (error) {
      console.error('Error fetching health check history:', error);
    }
  };

  const saveHealthCheck = async (
    answers: Record<number, string>,
    score: number,
    recommendations: string[],
    followUpAnswers: Record<number, string> = {}
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(API_ENDPOINTS.HEALTH_CHECK_SAVE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          score,
          recommendations,
          followUpAnswers
        })
      });

      if (response.ok) {
        // Refresh data after saving
        try {
          await refreshData();
        } catch (refreshError) {
          console.error('Error refreshing data after save:', refreshError);
          // Don't throw here, the save was successful
        }
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save health check');
      }
    } catch (error) {
      console.error('Error saving health check:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    if (!currentUser) return;
    
    try {
      await Promise.all([
        fetchLatestResult(),
        fetchStats(),
        fetchHistory()
      ]);
    } catch (error) {
      console.error('Error refreshing health check data:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      // Add a small delay to ensure authentication is fully loaded
      const timer = setTimeout(() => {
        refreshData();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Reset state when user logs out
      setLatestResult(null);
      setStats({
        totalAssessments: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        lastAssessment: null,
        trend: 'no-data'
      });
      setHistory([]);
      setError(null);
    }
  }, [currentUser]);

  return {
    latestResult,
    stats,
    history,
    loading,
    error,
    saveHealthCheck,
    refreshData,
    fetchHistory
  };
};

export default useHealthCheck;