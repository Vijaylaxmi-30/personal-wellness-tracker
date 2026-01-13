// API Configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Log API URL in development
if (import.meta.env.DEV) {
  console.log('API URL:', API_BASE_URL);
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('health_journey_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('health_journey_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('health_journey_token');
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    apiRequest<{ success: boolean; data: { user: any; token: string }; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiRequest<{ success: boolean; data: { user: any; token: string }; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    apiRequest<{ success: boolean; data: { user: any; xpToNextLevel: number } }>('/auth/me'),

  logout: () =>
    apiRequest<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiRequest<{ success: boolean; data: { user: any; xpToNextLevel: number } }>('/user/profile'),

  updateProfile: (data: any) =>
    apiRequest<{ success: boolean; data: { user: any }; message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateGoals: (goals: any) =>
    apiRequest<{ success: boolean; data: { goals: any }; message: string }>('/user/goals', {
      method: 'PUT',
      body: JSON.stringify(goals),
    }),

  addXP: (amount: number, reason?: string) =>
    apiRequest<{ success: boolean; data: any; message: string }>('/user/xp', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),

  getGamification: () =>
    apiRequest<{ success: boolean; data: any }>('/user/gamification'),

  updateAvatar: (avatar: string) =>
    apiRequest<{ success: boolean; data: { avatar: string }; message: string }>('/user/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar }),
    }),
};

// Quiz API
export const quizAPI = {
  getQuestions: (count = 5, category?: string) => {
    const params = new URLSearchParams({ count: count.toString() });
    if (category) params.append('category', category);
    return apiRequest<{ success: boolean; data: { questions: any[]; totalQuestions: number } }>(
      `/quiz/questions?${params}`
    );
  },

  submitQuiz: (answers: Array<{ questionId: string; selectedAnswer: number }>) =>
    apiRequest<{
      success: boolean;
      data: {
        score: number;
        totalQuestions: number;
        percentage: number;
        xpEarned: number;
        results: any[];
        leveledUp: boolean;
        newLevel: number;
      };
      message: string;
    }>('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getHistory: (limit = 10, page = 1) =>
    apiRequest<{ success: boolean; data: { quizResults: any[]; pagination: any; stats: any } }>(
      `/quiz/history?limit=${limit}&page=${page}`
    ),

  getCategories: () =>
    apiRequest<{ success: boolean; data: { categories: string[] } }>('/quiz/categories'),
};

// Meals API
export const mealsAPI = {
  getMeals: (date?: string, limit = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (date) params.append('date', date);
    return apiRequest<{
      success: boolean;
      data: { meals: any[]; totals: any; count: number };
    }>(`/meals?${params}`);
  },

  addMeal: (meal: {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    mealType?: string;
  }) =>
    apiRequest<{ success: boolean; data: { meal: any }; message: string }>('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),

  analyzeMeal: async (imageFile: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/meals/analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  saveAnalyzedMeal: (meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
    imageUrl: string;
    aiConfidence: number;
  }) =>
    apiRequest<{ success: boolean; data: { meal: any }; message: string }>('/meals/save-analyzed', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),

  deleteMeal: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/meals/${id}`, {
      method: 'DELETE',
    }),

  getSummary: (days = 7) =>
    apiRequest<{ success: boolean; data: { summary: any[]; days: number } }>(
      `/meals/summary?days=${days}`
    ),
};

// Activity API
export const activityAPI = {
  getActivities: (date?: string, limit = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (date) params.append('date', date);
    return apiRequest<{
      success: boolean;
      data: { activities: any[]; totals: any; count: number };
    }>(`/activity?${params}`);
  },

  logActivity: (activity: {
    type: string;
    duration: number;
    caloriesBurned?: number;
    intensity?: string;
    notes?: string;
  }) =>
    apiRequest<{ success: boolean; data: { activity: any; xpEarned: number }; message: string }>(
      '/activity',
      {
        method: 'POST',
        body: JSON.stringify(activity),
      }
    ),

  deleteActivity: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/activity/${id}`, {
      method: 'DELETE',
    }),

  getTypes: () =>
    apiRequest<{ success: boolean; data: { activityTypes: any[] } }>('/activity/types'),

  getWeekly: () =>
    apiRequest<{ success: boolean; data: any }>('/activity/weekly'),

  calculateCalories: (type: string, duration: number) =>
    apiRequest<{ success: boolean; data: { estimatedCalories: number } }>(
      '/activity/calculate-calories',
      {
        method: 'POST',
        body: JSON.stringify({ type, duration }),
      }
    ),
};

// Stats API
export const statsAPI = {
  getToday: () =>
    apiRequest<{ success: boolean; data: { stats: any; goals: any; overallProgress: number } }>(
      '/stats/today'
    ),

  updateToday: (data: any) =>
    apiRequest<{ success: boolean; data: { stats: any; overallProgress: number }; message: string }>(
      '/stats/today',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),

  addWater: (glasses = 1) =>
    apiRequest<{ success: boolean; data: any; message: string }>('/stats/water', {
      method: 'POST',
      body: JSON.stringify({ glasses }),
    }),

  updateSteps: (steps: number) =>
    apiRequest<{ success: boolean; data: any; message: string }>('/stats/steps', {
      method: 'POST',
      body: JSON.stringify({ steps }),
    }),

  logSleep: (hours: number, quality?: string) =>
    apiRequest<{ success: boolean; data: any; message: string }>('/stats/sleep', {
      method: 'POST',
      body: JSON.stringify({ hours, quality }),
    }),

  getWeekly: () =>
    apiRequest<{ success: boolean; data: { dailyStats: any[]; summary: any } }>('/stats/weekly'),

  getMonthly: () =>
    apiRequest<{ success: boolean; data: { weeklyData: any[]; totalDays: number } }>('/stats/monthly'),

  getQuote: () =>
    apiRequest<{ success: boolean; data: { quote: { text: string; author: string } } }>(
      '/stats/quotes'
    ),
};

// Achievements API
export const achievementsAPI = {
  getAll: () =>
    apiRequest<{
      success: boolean;
      data: { achievements: any[]; stats: { total: number; unlocked: number; totalXPFromAchievements: number } };
    }>('/achievements'),

  check: () =>
    apiRequest<{
      success: boolean;
      data: { newlyUnlocked: any[]; totalXPEarned: number };
    }>('/achievements/check', {
      method: 'POST',
    }),

  getRecent: (limit = 5) =>
    apiRequest<{ success: boolean; data: { achievements: any[] } }>(
      `/achievements/recent?limit=${limit}`
    ),
};

// BMI API
export const bmiAPI = {
  calculate: (weight: number, height: number, fitnessLevel = 'beginner') =>
    apiRequest<{
      success: boolean;
      data: {
        bmi: number;
        category: string;
        recommendations: string[];
        workoutPlan: any[];
      };
      message: string;
    }>('/bmi/calculate', {
      method: 'POST',
      body: JSON.stringify({ weight, height, fitnessLevel }),
    }),

  getHistory: (limit = 30) =>
    apiRequest<{
      success: boolean;
      data: { history: any[]; trend: any; latestRecord: any };
    }>(`/bmi/history?limit=${limit}`),

  getLatest: () =>
    apiRequest<{ success: boolean; data: { record: any } }>('/bmi/latest'),

  getRecommendations: (fitnessLevel = 'beginner') =>
    apiRequest<{ success: boolean; data: any }>(`/bmi/recommendations?fitnessLevel=${fitnessLevel}`),
};

export default {
  auth: authAPI,
  user: userAPI,
  quiz: quizAPI,
  meals: mealsAPI,
  activity: activityAPI,
  stats: statsAPI,
  achievements: achievementsAPI,
  bmi: bmiAPI,
};

