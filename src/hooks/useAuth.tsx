import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { AppState } from 'react-native';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { FirestoreUser } from '../types/user';
import { userService } from '../services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUser, setFirestoreUser, setOnboardingComplete, setLoading } = useAuthStore();

    useEffect(() => {
        // Track the inner user snapshot listener so it can be cleaned up
        // when auth state changes (avoids duplicate listeners & memory leaks)
        let unsubscribeUser: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            // Always cancel previous user listener before starting a new one
            if (unsubscribeUser) {
                unsubscribeUser();
                unsubscribeUser = undefined;
            }

            setUser(user);

            if (user) {
                // Update presence to online
                userService.updatePresence(user.uid, true);

                unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                    if (snap.exists()) {
                        const userData = snap.data() as FirestoreUser;
                        setFirestoreUser(userData);
                        setOnboardingComplete(userData.onboardingComplete || false);
                    } else {
                        setFirestoreUser(null);
                        setOnboardingComplete(false);
                    }
                    setLoading(false);
                });
            } else {
                setFirestoreUser(null);
                setOnboardingComplete(false);
                setLoading(false);
            }
        });

        const handleAppStateChange = (nextAppState: string) => {
            if (auth.currentUser) {
                const isOnline = nextAppState === 'active';
                userService.updatePresence(auth.currentUser.uid, isOnline);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
            subscription.remove();
            // Try to set offline if possible on cleanup (though subscription removal is usually enough)
            if (auth.currentUser) {
                userService.updatePresence(auth.currentUser.uid, false);
            }
        };
    }, [setUser, setFirestoreUser, setOnboardingComplete, setLoading]);

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
