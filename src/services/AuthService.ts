import { auth as authInstance, db } from '@/config/firebase';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { UserProfile } from '@/types';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface SignUpData {
    email: string;
    password?: string;
    displayName: string;
    username: string;
    bio?: string;
    avatar?: string;
    interests?: string[];
}

class AuthService {
    private googleConfigured = false;

    /**
     * Lazily configure Google Sign-In (called before first use, not in constructor)
     */
    private ensureGoogleConfigured(): void {
        if (this.googleConfigured) return;
        try {
            GoogleSignin.configure({
                webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
                offlineAccess: true,
            });
            this.googleConfigured = true;
        } catch (error) {
            console.warn('Google Sign-In configuration failed:', error);
        }
    }

    /**
     * Sign up a new user
     */
    async signUp(data: SignUpData): Promise<void> {
        try {
            if (!data.password) throw new Error('Password is required');

            const userCredential = await authInstance.createUserWithEmailAndPassword(
                data.email,
                data.password
            );

            const { user } = userCredential;

            // Create user profile in Firestore
            const userProfile: UserProfile = {
                id: user.uid,
                uid: user.uid,
                email: data.email,
                displayName: data.displayName,
                username: data.username.toLowerCase(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=random`,
                bio: '',
                role: 'customer',
                status: 'online',
                interests: [],
                createdAt: firestore.FieldValue.serverTimestamp(),
                settings: {
                    privacy: {
                        friendRequests: 'everyone',
                        directMessages: 'everyone',
                        serverInvites: 'everyone',
                    },
                    notifications: {
                        mentions: true,
                        directMessages: true,
                        friendRequests: true,
                    },
                },
            };

            await db.collection('users').doc(user.uid).set(userProfile);

            // Send email verification
            await user.sendEmailVerification();
        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    }

    /**
     * Sign in existing user
     */
    async signIn(email: string, password: string, rememberMe: boolean = false): Promise<void> {
        try {
            await authInstance.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Error in signIn:', error);
            throw error;
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle(): Promise<void> {
        try {
            this.ensureGoogleConfigured();
            // Check if device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken || (response as any).idToken;

            if (!idToken) throw new Error('No ID token from Google Sign In');

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            // Sign-in the user with the credential
            const userCredential = await authInstance.signInWithCredential(googleCredential);

            const { user, additionalUserInfo } = userCredential;

            // If it's a new user, create their profile
            if (additionalUserInfo?.isNewUser) {
                const userProfile: UserProfile = {
                    id: user.uid,
                    uid: user.uid,
                    email: user.email!,
                    displayName: user.displayName || 'User',
                    username: (user.displayName?.toLowerCase().replace(/\s/g, '_') || 'user') + Math.floor(Math.random() * 1000),
                    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`,
                    bio: '',
                    role: 'customer',
                    status: 'online',
                    interests: [],
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    settings: {
                        privacy: {
                            friendRequests: 'everyone',
                            directMessages: 'everyone',
                            serverInvites: 'everyone',
                        },
                        notifications: {
                            mentions: true,
                            directMessages: true,
                            friendRequests: true,
                        },
                    },
                };
                await db.collection('users').doc(user.uid).set(userProfile);
            }
        } catch (error) {
            console.error('Error in signInWithGoogle:', error);
            throw error;
        }
    }

    /**
     * Sign out user
     */
    async signOut(): Promise<void> {
        try {
            this.ensureGoogleConfigured();
            await GoogleSignin.signOut().catch(() => { });
            await authInstance.signOut();
        } catch (error) {
            console.error('Error in signOut:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     */
    async resetPassword(email: string): Promise<void> {
        try {
            await authInstance.sendPasswordResetEmail(email);
        } catch (error) {
            console.error('Error in resetPassword:', error);
            throw error;
        }
    }

    /**
     * Re-authenticate user (required for sensitive operations)
     */
    async reauthenticate(password: string): Promise<void> {
        try {
            const user = authInstance.currentUser;
            if (!user || !user.email) throw new Error('No user logged in');
            const credential = auth.EmailAuthProvider.credential(user.email, password);
            await user.reauthenticateWithCredential(credential);
        } catch (error) {
            console.error('Error in reauthenticate:', error);
            throw error;
        }
    }

    async deleteAccount(): Promise<void> {
        try {
            const user = authInstance.currentUser;
            if (!user) return;

            const uid = user.uid;

            // Delete Firebase Auth account first.
            // If this throws auth/requires-recent-login, the Firestore doc is preserved.
            await user.delete();

            // Only delete Firestore doc after successful auth deletion.
            await db.collection('users').doc(uid).delete();
        } catch (error) {
            console.error('Error in deleteAccount:', error);
            throw error;
        }
    }

    /**
     * Sign in with Phone (Send OTP)
     */
    async signInWithPhone(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
        try {
            const confirmation = await authInstance.signInWithPhoneNumber(phoneNumber);
            return confirmation;
        } catch (error) {
            console.error('Error in signInWithPhone:', error);
            throw error;
        }
    }

    /**
     * Confirm phone OTP and create profile if new user
     */
    async confirmPhoneCode(confirmation: FirebaseAuthTypes.ConfirmationResult, code: string): Promise<void> {
        try {
            const userCredential = await confirmation.confirm(code);
            if (!userCredential) throw new Error('Phone verification failed');

            const { user } = userCredential;

            // Check if a profile already exists
            const profileDoc = await db.collection('users').doc(user.uid).get();
            if (!profileDoc.exists) {
                // Create profile for phone-authenticated user
                const phoneDisplay = user.phoneNumber || 'Phone User';
                const userProfile: UserProfile = {
                    id: user.uid,
                    uid: user.uid,
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    displayName: phoneDisplay,
                    username: 'user_' + user.uid.substring(0, 8).toLowerCase(),
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phoneDisplay)}&background=random`,
                    bio: '',
                    role: 'customer',
                    status: 'online',
                    interests: [],
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    settings: {
                        privacy: {
                            friendRequests: 'everyone',
                            directMessages: 'everyone',
                            serverInvites: 'everyone',
                        },
                        notifications: {
                            mentions: true,
                            directMessages: true,
                            friendRequests: true,
                        },
                    },
                };
                await db.collection('users').doc(user.uid).set(userProfile);
            }
        } catch (error) {
            console.error('Error in confirmPhoneCode:', error);
            throw error;
        }
    }

    /**
     * Send email verification
     */
    async sendEmailVerification(): Promise<void> {
        try {
            const user = authInstance.currentUser;
            if (user) {
                await user.sendEmailVerification();
            }
        } catch (error) {
            console.error('Error in sendEmailVerification:', error);
            throw error;
        }
    }

    /**
     * Change Password
     */
    async changePassword(newPassword: string): Promise<void> {
        try {
            const user = authInstance.currentUser;
            if (user) {
                await user.updatePassword(newPassword);
            }
        } catch (error) {
            console.error('Error in changePassword:', error);
            throw error;
        }
    }
}

export default new AuthService();
