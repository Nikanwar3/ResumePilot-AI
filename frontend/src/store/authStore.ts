import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, TokenPair } from '../types';

interface AuthStore {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: TokenPair) => void;
  setTokens: (tokens: TokenPair) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),

      setTokens: (tokens) =>
        set({ tokens }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: 'resumepilot-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
