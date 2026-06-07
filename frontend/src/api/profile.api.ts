import apiClient from './client';
import { ApiResponse, Profile } from '../types';

export const profileApi = {
  get: () =>
    apiClient.get<ApiResponse<Profile>>('/profile').then((r) => r.data),

  upsert: (data: Partial<Profile>) =>
    apiClient.put<ApiResponse<Profile>>('/profile', data).then((r) => r.data),

  addEducation: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/profile/education', data).then((r) => r.data),

  updateEducation: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse>(`/profile/education/${id}`, data).then((r) => r.data),

  deleteEducation: (id: string) =>
    apiClient.delete<ApiResponse>(`/profile/education/${id}`).then((r) => r.data),

  updateSkills: (skills: Array<{ name: string; level?: string; category?: string }>) =>
    apiClient.put<ApiResponse>('/profile/skills', { skills }).then((r) => r.data),

  addExperience: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/profile/experience', data).then((r) => r.data),

  addProject: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/profile/projects', data).then((r) => r.data),

  addCertification: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/profile/certifications', data).then((r) => r.data),

  addAchievement: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/profile/achievements', data).then((r) => r.data),
};
