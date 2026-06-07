import { create } from 'zustand';
import { InterviewSession, InterviewMessage } from '../types';

interface InterviewStore {
  currentSession: InterviewSession | null;
  messages: InterviewMessage[];
  isLoading: boolean;
  isSending: boolean;
  phase: string;
  progress: number;
  isComplete: boolean;

  setSession: (session: InterviewSession) => void;
  addMessage: (message: InterviewMessage) => void;
  setMessages: (messages: InterviewMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  updateProgress: (phase: string, progress: number) => void;
  setComplete: (complete: boolean) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  phase: 'personal',
  progress: 0,
  isComplete: false,

  setSession: (session) =>
    set({
      currentSession: session,
      messages: session.messages || [],
      phase: session.phase,
      progress: session.progress,
      isComplete: session.status === 'completed',
    }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),

  setLoading: (isLoading) => set({ isLoading }),

  setSending: (isSending) => set({ isSending }),

  updateProgress: (phase, progress) => set({ phase, progress }),

  setComplete: (isComplete) => set({ isComplete }),

  reset: () =>
    set({
      currentSession: null,
      messages: [],
      isLoading: false,
      isSending: false,
      phase: 'personal',
      progress: 0,
      isComplete: false,
    }),
}));
