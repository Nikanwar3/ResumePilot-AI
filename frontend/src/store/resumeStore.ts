import { create } from 'zustand';
import { Resume, ATSReport } from '../types';

interface ResumeStore {
  resumes: Resume[];
  currentResume: Resume | null;
  currentATSReport: ATSReport | null;
  isGenerating: boolean;

  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  setCurrentResume: (resume: Resume | null) => void;
  setCurrentATSReport: (report: ATSReport | null) => void;
  setGenerating: (generating: boolean) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  removeResume: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  currentResume: null,
  currentATSReport: null,
  isGenerating: false,

  setResumes: (resumes) => set({ resumes }),

  addResume: (resume) =>
    set((state) => ({ resumes: [resume, ...state.resumes] })),

  setCurrentResume: (currentResume) => set({ currentResume }),

  setCurrentATSReport: (currentATSReport) => set({ currentATSReport }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  updateResume: (id, updates) =>
    set((state) => ({
      resumes: state.resumes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      currentResume: state.currentResume?.id === id
        ? { ...state.currentResume, ...updates }
        : state.currentResume,
    })),

  removeResume: (id) =>
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== id),
      currentResume: state.currentResume?.id === id ? null : state.currentResume,
    })),
}));
