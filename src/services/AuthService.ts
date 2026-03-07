import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    deleteUser,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    UserCredential,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { FirestoreUser } from '../types/user';

export const authService = {
    signUpWithEmail: async (email: string, password: string, displayName: string): Promise<UserCredential> => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // Create initial firestore record
        const userDoc: Partial<FirestoreUser> = {
            uid: user.uid,
            email: user.email || '',
            displayName: displayName,
            photoURL: '',
            phoneNumber: '',
            role: 'customer',
            bio: '',
            interests: [],
            joinedAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
            isOnline: true,
            isVerified: false,
            isSellerApproved: false,
            fcmTokens: [],
            pushToken: null,
            friends: [],
            friendRequests: [],
            sentRequests: [],
            blockedUsers: [],
            settings: {
                theme: 'system',
                notifications: true,
            },
            onboardingComplete: false,
        };

        await setDoc(doc(db, 'users', user.uid), userDoc);
        return credential;
    },

    signInWithEmail: async (email: string, password: string): Promise<UserCredential> => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    // Note: signInWithGoogle requires idToken from expo-auth-session/providers/google
    signInWithGoogle: async (idToken: string): Promise<UserCredential> => {
        const credential = GoogleAuthProvider.credential(idToken);
        return signInWithCredential(auth, credential);
    },

    sendVerificationEmail: async (): Promise<void> => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
        }
    },

    sendPasswordReset: async (email: string): Promise<void> => {
        await sendPasswordResetEmail(auth, email);
    },

    // Phone Auth
    signInWithPhone: async (phoneNumber: string, recaptchaVerifier: any): Promise<ConfirmationResult> => {
        return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    },

    verifyOTP: async (confirmationResult: ConfirmationResult, otp: string): Promise<UserCredential> => {
        return confirmationResult.confirm(otp);
    },

    signOut: async (): Promise<void> => {
        await firebaseSignOut(auth);
    },

    deleteAccount: async (): Promise<void> => {
        if (auth.currentUser) {
            await deleteUser(auth.currentUser);
        }
    },

    updateUserPassword: async (newPassword: string): Promise<void> => {
        if (auth.currentUser) {
            await updatePassword(auth.currentUser, newPassword);
        }
    },

    reauthenticate: async (password: string): Promise<void> => {
        if (auth.currentUser && auth.currentUser.email) {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);
        }
    },
};
