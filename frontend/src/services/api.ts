import axios from 'axios';

const API_URL = '/api';

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

// ── Interfaces ──────────────────────────────────────────

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  cover_image?: string;
  published_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: number;
  username: string;
  role?: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Comment {
  id: number;
  post_id: number;
  post_title?: string;
  post_slug?: string;
  author_name: string;
  content: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Stats {
  posts: number;
  publishedPosts: number;
  users: number;
  comments: number;
  pendingComments: number;
  tags: number;
  recentPosts: Post[];
  recentComments: Comment[];
}

export interface RegisterData {
  username: string;
  password: string;
}

// ── Auth ────────────────────────────────────────────────

export const login = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ── Posts ───────────────────────────────────────────────

export const getPosts = (search?: string, page = 1, limit = 10) =>
  api.get<PaginatedResponse<Post>>('/posts', { params: { search, page, limit } });

export const getMyPosts = (search?: string, page = 1, limit = 10) =>
  api.get<PaginatedResponse<Post>>('/posts/my/all', { params: { search, page, limit } });

export const getAdminPosts = (search?: string, page = 1, limit = 10) =>
  api.get<PaginatedResponse<Post>>('/posts/admin/all', { params: { search, page, limit } });

export const getPostForEdit = (id: number) => api.get<Post>(`/posts/edit/${id}`);

export const getPostBySlug = (slug: string) => api.get<Post>(`/posts/${slug}`);

export const createPost = (post: Omit<Post, 'id' | 'created_at' | 'updated_at'> & { cover_image?: string }) =>
  api.post('/posts', post);

export const updatePost = (id: number, post: Partial<Post>) =>
  api.put(`/posts/${id}`, post);

export const deletePost = (id: number) => api.delete(`/posts/${id}`);

// ── Users ───────────────────────────────────────────────

export const getUsers = () => api.get<User[]>('/users');

export const createUser = (data: { username: string; password: string }) =>
  api.post('/users', data);

export const updateUser = (id: number, data: { username?: string; password?: string }) =>
  api.put(`/users/${id}`, data);

export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// ── Tags ────────────────────────────────────────────────

export const getTags = () => api.get<Tag[]>('/tags');

export const createTag = (data: { name: string; slug: string }) =>
  api.post('/tags', data);

export const updateTag = (id: number, data: { name?: string; slug?: string }) =>
  api.put(`/tags/${id}`, data);

export const deleteTag = (id: number) => api.delete(`/tags/${id}`);

export const getPostTags = (postId: number) => api.get<Tag[]>(`/tags/post/${postId}`);

export const setPostTags = (postId: number, tagIds: number[]) =>
  api.post(`/tags/post/${postId}`, { tagIds });

// ── Comments ────────────────────────────────────────────

export const getComments = (params?: { post_id?: number; status?: string }) =>
  api.get<Comment[]>('/admin/comments', { params });

export const getPostComments = (slug: string) =>
  api.get<Comment[]>(`/comments/post/${slug}`);

export const submitComment = (data: { post_id: number; author_name: string; content: string; image_url?: string }) =>
  api.post('/comments', data);

// ── Upload ──────────────────────────────────────────────

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data as { url: string };
};

export const updateCommentStatus = (id: number, status: string) =>
  api.put(`/admin/comments/${id}`, { status });

export const deleteComment = (id: number) => api.delete(`/admin/comments/${id}`);

// ── Stats ───────────────────────────────────────────────

export const getStats = () => api.get<Stats>('/stats');

export default api;
