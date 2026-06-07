import apiClient from './client';
import { ApiResponse, InterviewSession } from '../types';

export const interviewApi = {
  createSession: () =>
    apiClient.post<ApiResponse<InterviewSession>>('/interview/sessions').then((r) => r.data),

  getSessions: () =>
    apiClient.get<ApiResponse<InterviewSession[]>>('/interview/sessions').then((r) => r.data),

  getSession: (sessionId: string) =>
    apiClient.get<ApiResponse<InterviewSession>>(`/interview/sessions/${sessionId}`).then((r) => r.data),

  sendMessage: (sessionId: string, message: string) =>
    apiClient.post<ApiResponse<{
      session: InterviewSession;
      latestMessage: { role: string; content: string; timestamp: string };
      phase: string;
      progress: number;
      isComplete: boolean;
    }>>(`/interview/sessions/${sessionId}/message`, { message }).then((r) => r.data),

  extractProfile: (sessionId: string) =>
    apiClient.post<ApiResponse<Record<string, unknown>>>(`/interview/sessions/${sessionId}/extract`).then((r) => r.data),

  completeSession: (sessionId: string) =>
    apiClient.post<ApiResponse<InterviewSession>>(`/interview/sessions/${sessionId}/complete`).then((r) => r.data),
};
