// lib/api.ts

// ❗ HAPUS SPASI DI AKHIR URL!
const API_BASE_URL = 'https://nonabstractly-unmoaning-tameka.ngrok-free.dev';

// =============== Helper Functions ===============
// Helper untuk mendapatkan CSRF token (Laravel Sanctum)
export const getCsrfToken = async (): Promise<boolean> => {
  try {
    console.log('🔐 Getting CSRF token...');
    
    // Coba beberapa endpoint CSRF yang umum
    const endpoints = [
      `${API_BASE_URL}/sanctum/csrf-cookie`,  // Laravel Sanctum
      `${API_BASE_URL}/api/csrf-token`,       // Laravel API
      `${API_BASE_URL}/csrf-cookie`,          // Laravel default
    ];
    
    let success = false;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying CSRF endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include', // Penting untuk cookies
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        if (response.ok) {
          console.log('✅ CSRF token obtained successfully');
          success = true;
          break;
        }
      } catch (endpointError) {
        console.log(`❌ Failed for ${endpoint}:`, endpointError);
        continue;
      }
    }
    
    if (!success) {
      console.warn('⚠️ Could not get CSRF token from any endpoint');
    }
    
    return success;
  } catch (error: any) {
    console.error('❌ CSRF token fetch error:', error);
    return false;
  }
};

// Helper: tambahkan header wajib
const getAuthHeaders = (token?: string | null, includeJsonContent: boolean = true) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'X-Requested-With': 'XMLHttpRequest', // Penting untuk Laravel Sanctum
  };
  
  if (includeJsonContent) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper untuk handle fetch dengan credentials
const fetchWithAuth = async (
  url: string,
  options: RequestInit & { token?: string | null } = {}
) => {
  const { token, ...fetchOptions } = options;
  
  const defaultOptions: RequestInit = {
    credentials: 'include' as RequestCredentials, // SELALU sertakan cookies
    headers: getAuthHeaders(token, fetchOptions.method !== 'GET'),
    ...fetchOptions,
  };
  
  // Untuk POST/PUT/DELETE, pastikan CSRF token sudah ada
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method || '')) {
    await getCsrfToken();
  }
  
  console.log(`🌐 Making request to: ${url}`);
  console.log('📤 Request options:', {
    method: defaultOptions.method,
    headers: defaultOptions.headers,
    hasBody: !!defaultOptions.body,
  });
  
  const response = await fetch(url, defaultOptions);
  
  console.log(`📥 Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', {
      status: response.status,
      url,
      error: errorText,
    });
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || 'Unknown error' };
    }
    
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
  }
  
  return response;
};

// =============== Interfaces ===============
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export interface LoginData {
  email: string;
  password: string;
  device_name?: string; // Untuk Sanctum API token
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  gender?: string;
  phone?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface QuestionCreateData {
  title: string;
  body: string;
}

export interface AnswerCreateData {
  body: string;
  question_id: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  error?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  gender?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  email_verified_at?: string | null;
  role?: string;
  is_admin?: boolean | number;
}

export interface Question {
  id: number;
  title: string;
  body: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  answers_count: number;
  likes_count: number;
  user_has_liked: boolean;
  answers?: Answer[];
  tags?: string[];
}

export interface Answer {
  id: number;
  body: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  question_id: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  user_has_liked: boolean;
}

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  reply: string;
  suggestions?: string[];
}

// =============== Auth Functions ===============
export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    console.log('👤 Registering user...');
    
    // Dapatkan CSRF token terlebih dahulu
    await getCsrfToken();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('✅ Registration successful:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Register API error:', error);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

export const loginUser = async (data: LoginData): Promise<ApiResponse> => {
  try {
    console.log('🔑 Logging in...');
    
    // LANGKAH 1: Dapatkan CSRF token
    console.log('🔄 Step 1: Getting CSRF token...');
    await getCsrfToken();
    
    // LANGKAH 2: Login dengan credentials
    console.log('🔄 Step 2: Sending login request...');
    
    // Tambahkan device_name untuk Sanctum token
    const loginData = {
      ...data,
      device_name: 'react-native-app', // atau 'mobile-app'
    };
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    const result = await response.json();
    
    if (!result.token && result.user) {
      console.log('ℹ️ No token in response, using cookie-based session');
    } else if (result.token) {
      console.log('✅ Token received:', result.token.substring(0, 20) + '...');
    }
    
    console.log('✅ Login successful');
    return result;
  } catch (error: any) {
    console.error('❌ Login API error:', error);
    
    // Beri pesan error yang lebih spesifik
    if (error.message.includes('CSRF') || error.message.includes('419')) {
      throw new Error('Session expired. Please refresh and try again.');
    } else if (error.message.includes('credentials') || error.message.includes('401')) {
      throw new Error('Invalid email or password.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error. Check your connection.');
    }
    
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

export const logoutUser = async (token?: string): Promise<void> => {
  try {
    console.log('🚪 Logging out...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      token,
    });
    
    const result = await response.json();
    console.log('✅ Logout successful:', result);
  } catch (error: any) {
    console.error('❌ Logout API error:', error);
    // Tetap anggap berhasil logout meski ada error
    console.log('⚠️ Proceeding with local logout despite API error');
  }
};

// =============== Profile Functions ===============
export const getProfile = async (token?: string): Promise<UserProfile> => {
  try {
    console.log('👤 Fetching profile...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/user`, {
      method: 'GET',
      token,
    });
    
    const data = await response.json();
    console.log('✅ Profile data received');
    return data;
  } catch (error: any) {
    console.error('❌ Profile fetch error:', error);
    
    // Fallback data untuk development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Using fallback profile data for development');
      return {
        id: 1,
        name: 'Development User',
        email: 'dev@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    throw error;
  }
};

export const updateProfile = async (
  token: string,
  data: ProfileUpdateData
): Promise<UserProfile> => {
  try {
    console.log('🔄 Updating profile...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('✅ Profile update successful');
    return result;
  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    throw error;
  }
};

export const deleteAccount = async (token: string, password: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting account...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/profile`, {
      method: 'DELETE',
      token,
      body: JSON.stringify({ password }),
    });
    
    console.log('✅ Account deleted successfully');
  } catch (error: any) {
    console.error('❌ Delete account error:', error);
    throw error;
  }
};

// =============== Question Functions ===============
export const getQuestions = async (token?: string): Promise<Question[]> => {
  try {
    console.log('📋 Fetching questions...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/questions`, {
      method: 'GET',
      token,
    });
    
    const data = await response.json();
    console.log(`✅ Received ${Array.isArray(data) ? data.length : 0} questions`);
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('❌ Questions fetch error:', error);
    
    // Fallback questions untuk development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Using fallback questions for development');
      return [
        {
          id: 1,
          title: 'How to maintain a healthy diet?',
          body: 'Tips for beginners starting a healthy lifestyle',
          user: { id: 1, name: 'John Doe', email: 'john@example.com' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          answers_count: 3,
          likes_count: 12,
          user_has_liked: false,
          tags: ['health', 'nutrition']
        },
        {
          id: 2,
          title: 'Best exercises for beginners?',
          body: 'Looking for beginner-friendly workout recommendations',
          user: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          answers_count: 1,
          likes_count: 5,
          user_has_liked: true,
          tags: ['exercise', 'fitness']
        }
      ];
    }
    
    return [];
  }
};

export const getQuestionDetail = async (
  token: string,
  id: number
): Promise<Question> => {
  try {
    console.log(`📖 Fetching question ${id} detail...`);
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/questions/${id}`, {
      method: 'GET',
      token,
    });
    
    const data = await response.json();
    console.log('✅ Question detail received');
    return data;
  } catch (error: any) {
    console.error('❌ Question detail error:', error);
    throw error;
  }
};

export const createQuestion = async (
  token: string,
  data: QuestionCreateData
): Promise<Question> => {
  try {
    console.log('📝 Creating question...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/questions`, {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('✅ Question created successfully');
    return result;
  } catch (error: any) {
    console.error('❌ Create question error:', error);
    throw error;
  }
};

// =============== Answer Functions ===============
export const postAnswer = async (
  token: string,
  questionId: number,
  data: AnswerCreateData
): Promise<Answer> => {
  try {
    console.log(`💬 Posting answer to question ${questionId}...`);
    
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/questions/${questionId}/answers`,
      {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }
    );
    
    const result = await response.json();
    console.log('✅ Answer posted successfully');
    return result;
  } catch (error: any) {
    console.error('❌ Post answer error:', error);
    throw error;
  }
};

// =============== Like Functions ===============
export const toggleLike = async (
  token: string,
  type: 'question' | 'answer',
  id: number
): Promise<any> => {
  try {
    console.log(`👍 Toggling like for ${type} ${id}...`);
    
    const endpoint = 
      type === 'question'
        ? `${API_BASE_URL}/api/questions/${id}/like`
        : `${API_BASE_URL}/api/answers/${id}/like`;
    
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      token,
    });
    
    const result = await response.json();
    console.log('✅ Like toggled successfully');
    return result;
  } catch (error: any) {
    console.error('❌ Like error:', error);
    throw error;
  }
};

// =============== Chatbot Functions ===============
export const sendChatMessage = async (
  token: string,
  message: string
): Promise<ChatResponse> => {
  try {
    console.log('💭 Sending chat message...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      token,
      body: JSON.stringify({ message }),
    });
    
    const data = await response.json();
    console.log('✅ Chat response received');
    return data;
  } catch (error: any) {
    console.error('❌ Chat API error:', error);
    
    // Fallback responses
    const fallbackResponses = [
      "I'm having trouble connecting right now. Please try again in a moment.",
      "I'm currently experiencing technical difficulties. Here are some health tips:\n• Drink plenty of water\n• Get regular exercise\n• Eat balanced meals\n• Get enough sleep",
      "Connection issue detected. For now, I can help with:\n• Nutrition advice\n• Exercise recommendations\n• Sleep tips\n• Stress management"
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    
    return {
      reply: fallbackResponses[randomIndex],
      suggestions: [
        "Ask about nutrition",
        "Exercise tips",
        "Sleep advice",
        "Stress management"
      ]
    };
  }
};

// =============== Session Check ===============
export const checkSession = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking session...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/check-session`, {
      method: 'GET',
    });
    
    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.log('ℹ️ Session check failed, assuming not authenticated');
    return false;
  }
};

// =============== Utility Functions ===============
export const getApiBaseUrl = (): string => API_BASE_URL;

export const resetApiSession = async (): Promise<void> => {
  // Reset cookies/local storage jika diperlukan
  console.log('🔄 Resetting API session...');
  
  // Untuk React Native, Anda mungkin perlu membersihkan AsyncStorage
  try {
    // Jika menggunakan AsyncStorage
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // await AsyncStorage.removeItem('userToken');
    // await AsyncStorage.removeItem('userData');
    console.log('✅ API session reset');
  } catch (error) {
    console.error('❌ Error resetting session:', error);
  }
};

// =============== API Health Check ===============
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    console.log('🏥 Checking API health...');
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    const healthy = response.ok;
    console.log(healthy ? '✅ API is healthy' : '⚠️ API health check failed');
    return healthy;
  } catch (error) {
    console.error('❌ API health check error:', error);
    return false;
  }
};
export default {
  // Auth
  getCsrfToken,
  registerUser,
  loginUser,
  logoutUser,
  
  // Profile
  getProfile,
  updateProfile,
  deleteAccount,
  
  // Questions
  getQuestions,
  getQuestionDetail,
  createQuestion,
  
  // Answers
  postAnswer,
  
  // Likes
  toggleLike,
  
  // Chatbot
  sendChatMessage,
  
  // Session & Health
  checkSession,
  checkApiHealth,
  resetApiSession,
  getApiBaseUrl,
};

