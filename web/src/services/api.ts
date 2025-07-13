import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  created: string;
  updatedAt: string;
}

export interface Follow {
  id: string;
  follower: User;
  following: User;
  created: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Handle specific error cases
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An error occurred.');
      }

      throw new ApiError(status, data?.message || 'An error occurred', data?.code);
    } else {
      // Network error
      toast.error('Network error. Please check your connection.');
      throw new ApiError(0, 'Network error');
    }
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string; expiresIn: string }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Posts API
export const postsAPI = {
  getAll: async (filters: any = {}): Promise<ApiResponse<{ posts: Post[]; pagination: any }>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<{ post: Post }>> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: { content: string }): Promise<ApiResponse<{ post: Post }>> => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  update: async (data: { id: string; content: string }): Promise<ApiResponse<{ post: Post }>> => {
    const response = await api.put(`/posts/${data.id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};

// Also export the original postsApi for backward compatibility
export const postsApi = postsAPI;

// Follows API
export const followsApi = {
  followUser: async (userId: string): Promise<ApiResponse<{ follow: Follow }>> => {
    const response = await api.post(`/follows/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/follows/${userId}`);
    return response.data;
  },

  getFollowers: async (userId: string, page = 1, limit = 10): Promise<ApiResponse<{ followers: User[]; pagination: any }>> => {
    const response = await api.get(`/follows/followers/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getFollowing: async (userId: string, page = 1, limit = 10): Promise<ApiResponse<{ following: User[]; pagination: any }>> => {
    const response = await api.get(`/follows/following/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  checkFollowStatus: async (userId: string): Promise<ApiResponse<{ isFollowing: boolean; targetUser: User }>> => {
    const response = await api.get(`/follows/check/${userId}`);
    return response.data;
  },

  getFollowStats: async (userId: string): Promise<ApiResponse<{ followersCount: number; followingCount: number }>> => {
    const response = await api.get(`/follows/stats/${userId}`);
    return response.data;
  },
};

export default api; 