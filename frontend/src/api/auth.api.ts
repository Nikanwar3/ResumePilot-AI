import apiClient from './client';
import { ApiResponse, User, TokenPair } from '../types';

interface AuthData {
  user: User;
  tokens: TokenPair;
  isNew?: boolean;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', data).then((r) => r.data),

  googleAuth: (idToken: string) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/google', { idToken }).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<TokenPair>>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/auth/logout', { refreshToken }).then((r) => r.data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
};
