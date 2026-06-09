import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  published_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
    id: number;
    username: string;
}

// Auth
export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Posts
export const getPosts = () => api.get<Post[]>('/posts');
export const getAdminPosts = () => api.get<Post[]>('/posts/admin');
export const getPostBySlug = (slug: string) => api.get<Post>(`/posts/${slug}`);
export const createPost = (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => api.post('/posts', post);
export const updatePost = (id: number, post: Partial<Post>) => api.put(`/posts/${id}`, post);
export const deletePost = (id: number) => api.delete(`/posts/${id}`);

export default api;
