import { create } from 'zustand';
import { User, Role } from '../types/index.ts';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, accessToken: string) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false
    });
  },

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  updateUser: (updatedUser: Partial<User>) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updatedUser } });
    }
  },

  hasRole: (role: Role) => {
    return get().user?.role === role;
  }
}));

if (typeof window !== 'undefined') {
  (window as any).authStore = useAuthStore;
}

