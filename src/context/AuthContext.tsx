import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth, db } from '@/config/firebase';
import AuthService, { SignUpData } from '@/services/AuthService';
import UserService from '@/services/UserService';
import PushNotificationService from '@/services/PushNotificationService';
import { UserProfile } from '@/types';
import { getFirebaseAuthError } from '@/utils/helpers';

interface AuthContextType {
    user: FirebaseAuthTypes.User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    signInWithGoogle: () => Promise<boolean>;
    signInWithPhone: (phoneNumber: string) => Promise<FirebaseAuthTypes.ConfirmationResult | null>;
    register: (userData: SignUpData) => Promise<boolean>;
    resetPassword: (email: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<UserProfile>) => Promise<void>;
    updateAvatar: (uri: string) => Promise<void>;
    reauthenticate: (password: string) => Promise<boolean>;
    deleteAccount: (password: string) => Promise<boolean>;
    sendEmailVerification: () => Promise<void>;
    changePassword: (password: string) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let profileUnsubscribe: (() => void) | null = null;

        const authUnsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);

            // Clean up previous profile listener
            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            if (currentUser) {
                // Real-time user profile listener using Native Firebase
                profileUnsubscribe = db.collection('users').doc(currentUser.uid).onSnapshot((snapshot) => {
                    if (snapshot.exists) {
                        setUserProfile(snapshot.data() as UserProfile);
                    } else {
                        setUserProfile(null);
                    }
                    setIsLoading(false);
                }, (err) => {
                    console.error('Error fetching real-time profile:', err);
                    setIsLoading(false);
                });

                // Register for push notifications
                PushNotificationService.initialize().then(() => {
                    PushNotificationService.registerForPushNotifications();
                });
            } else {
                setUserProfile(null);
                setIsLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await AuthService.signIn(email, password, rememberMe);
            return true;
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await AuthService.signInWithGoogle();
            return true;
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (userData: SignUpData): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await AuthService.signUp(userData);
            return true;
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetPassword = useCallback(async (email: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await AuthService.resetPassword(email);
            return true;
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            await PushNotificationService.unregisterPushToken();
            await AuthService.signOut();
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const updateUser = useCallback(async (data: Partial<UserProfile>) => {
        if (!user) return;
        try {
            setError(null);
            await UserService.updateProfile(user.uid, data);
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            throw err;
        }
    }, [user]);

    const updateAvatar = useCallback(async (uri: string) => {
        if (!user) return;
        try {
            setError(null);
            await UserService.updateAvatar(user.uid, uri);
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            throw err;
        }
    }, [user]);

    const reauthenticate = useCallback(async (password: string): Promise<boolean> => {
        try {
            setError(null);
            await AuthService.reauthenticate(password);
            return true;
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return false;
        }
    }, []);

    const deleteAccount = useCallback(async (password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await AuthService.reauthenticate(password);
            await AuthService.deleteAccount();
            return true;
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signInWithPhone = useCallback(async (phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult | null> => {
        try {
            setIsLoading(true);
            setError(null);
            return await AuthService.signInWithPhone(phoneNumber);
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendEmailVerification = useCallback(async () => {
        try {
            setError(null);
            await AuthService.sendEmailVerification();
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            throw err;
        }
    }, []);

    const changePassword = useCallback(async (password: string) => {
        try {
            setError(null);
            await AuthService.changePassword(password);
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
            throw err;
        }
    }, []);

    const value = useMemo(() => ({
        user,
        userProfile,
        isLoading,
        error,
        login,
        signInWithGoogle,
        signInWithPhone,
        register,
        resetPassword,
        logout,
        updateUser,
        updateAvatar,
        reauthenticate,
        deleteAccount,
        sendEmailVerification,
        changePassword,
        clearError,
    }), [user, userProfile, isLoading, error, login, signInWithGoogle, signInWithPhone, register, resetPassword, logout, updateUser, updateAvatar, reauthenticate, deleteAccount, sendEmailVerification, changePassword, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
