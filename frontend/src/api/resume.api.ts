import apiClient from './client';
import { ApiResponse, Resume, ATSReport, JobDescription } from '../types';

export const resumeApi = {
  generate: (data: {
    title: string;
    template: string;
    jobDescriptionId?: string;
    targetRole?: string;
  }) =>
    apiClient.post<ApiResponse<Resume>>('/resume/generate', data).then((r) => r.data),

  getAll: () =>
    apiClient.get<ApiResponse<Resume[]>>('/resume').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Resume>>(`/resume/${id}`).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Resume>>(`/resume/public/${slug}`).then((r) => r.data),

  update: (id: string, data: Partial<Resume>) =>
    apiClient.put<ApiResponse<Resume>>(`/resume/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/resume/${id}`).then((r) => r.data),

  analyzeATS: (id: string, data: { jobDescriptionText?: string; jobDescriptionId?: string }) =>
    apiClient.post<ApiResponse<ATSReport>>(`/resume/${id}/ats`, data).then((r) => r.data),

  createVersion: (id: string, title: string) =>
    apiClient.post<ApiResponse<Resume>>(`/resume/${id}/version`, { title }).then((r) => r.data),

  exportPDF: (id: string) =>
    apiClient.get(`/resume/${id}/export/pdf`, { responseType: 'blob' }).then((r) => r.data),

  exportDOCX: (id: string) =>
    apiClient.get(`/resume/${id}/export/docx`, { responseType: 'blob' }).then((r) => r.data),

  analyzeJobDescription: (data: { content: string; title?: string; company?: string }) =>
    apiClient.post<ApiResponse<{ jd: JobDescription; parsed: Record<string, unknown> }>>('/resume/jd/analyze', data).then((r) => r.data),

  getJobDescriptions: () =>
    apiClient.get<ApiResponse<JobDescription[]>>('/resume/jd/list').then((r) => r.data),
};
