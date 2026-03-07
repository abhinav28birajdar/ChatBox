import { create } from 'zustand';
import { User } from 'firebase/auth';
import { FirestoreUser } from '../types/user';

interface AuthState {
    user: User | null;
    firestoreUser: FirestoreUser | null;
    isLoading: boolean;
    isOnboardingComplete: boolean;
    setUser: (user: User | null) => void;
    setFirestoreUser: (u: FirestoreUser | null) => void;
    setOnboardingComplete: (v: boolean) => void;
    setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    firestoreUser: null,
    isLoading: true,
    isOnboardingComplete: false,
    setUser: (user) => set({ user }),
    setFirestoreUser: (firestoreUser) => set({ firestoreUser }),
    setOnboardingComplete: (isOnboardingComplete) => set({ isOnboardingComplete }),
    setLoading: (isLoading) => set({ isLoading }),
}));
