// lib/api.ts
const API_BASE_URL = 'https://nonabstractly-unmoaning-tameka.ngrok-free.dev/api';

// ================== TYPES ==================
export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  phone?: string;
  email_verified_at?: string | null;
}

// ================== HELPERS ==================
const authHeaders = (token?: string) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  'ngrok-skip-browser-warning': 'true',
});

// ================== AUTH ==================
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const logoutUser = async (token: string): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return res.json();
};

// ================== PROFILE ==================
export const getProfile = async (token: string): Promise<User> => {
  const res = await fetch(`${API_BASE_URL}/user`, {
    headers: authHeaders(token),
  });
  return res.json();
};

export const updateProfile = async (token: string, data: {
  name?: string;
  email?: string;
  gender?: string;
  phone?: string;
}): Promise<User> => {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
};

// ================== HEALTH ==================
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      headers: authHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
};
// ================== TYPES ==================
export interface Answer {
  id: number;
  body: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  user_has_liked: boolean;
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
  answers_count: number;
  likes_count: number;
  user_has_liked: boolean;
  answers?: Answer[];
}

// ================== QUESTIONS ==================
export const getQuestions = async (token?: string): Promise<Question[]> => {
  const res = await fetch(`${API_BASE_URL}/questions`, {
    headers: authHeaders(token),
  });
  return res.json();
};

export const getQuestionDetail = async (id: number, token?: string): Promise<Question> => {
  const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
    headers: authHeaders(token),
  });
  return res.json();
};

export const createQuestion = async (
  token: string,
  data: { title: string; body: string }
): Promise<Question> => {
  const res = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
};

// ================== ANSWERS ==================
export const postAnswer = async (
  token: string,
  questionId: number,
  body: string
): Promise<Answer> => {
  const res = await fetch(`${API_BASE_URL}/questions/${questionId}/answers`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ body }),
  });
  return res.json();
};

// ================== VOTING ==================
export const voteQuestion = async (token: string, questionId: number): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/questions/${questionId}/vote`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return res.json();
};
