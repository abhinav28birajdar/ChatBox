/**
 * Centralized Firebase / app error handling utilities.
 * Import `parseFirebaseError` wherever you need user-friendly error messages.
 */

/**
 * Maps Firebase error codes to user-readable messages.
 * Falls back to the raw error message if the code is unknown.
 */
export function parseFirebaseError(error: unknown): string {
    const code: string = (error as any)?.code ?? '';
    const message: string = (error as any)?.message ?? '';

    switch (code) {
        // Auth errors
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':
            return 'Invalid credentials. Please check your email and password.';
        case 'auth/email-already-in-use':
            return 'This email address is already registered.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters long.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/requires-recent-login':
            return 'Please sign in again before performing this action.';
        case 'auth/user-disabled':
            return 'Your account has been disabled. Please contact support.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in was cancelled.';
        case 'auth/invalid-phone-number':
            return 'Please enter a valid phone number including country code.';
        case 'auth/invalid-verification-code':
            return 'Invalid OTP code. Please check and try again.';
        case 'auth/code-expired':
            return 'OTP code has expired. Please request a new one.';

        // Firestore errors
        case 'permission-denied':
        case 'firestore/permission-denied':
            return 'Permission denied. Please check your account permissions.';
        case 'not-found':
        case 'firestore/not-found':
            return 'The requested data was not found.';
        case 'unavailable':
        case 'firestore/unavailable':
            return 'Service temporarily unavailable. Please try again later.';
        case 'deadline-exceeded':
            return 'Request timed out. Please try again.';

        // Storage errors
        case 'storage/unauthorized':
            return 'You do not have permission to access this file.';
        case 'storage/quota-exceeded':
            return 'Storage quota exceeded. Please contact support.';
        case 'storage/object-not-found':
            return 'File not found.';

        default:
            // Return the raw message stripped of technical prefixes, or a generic fallback
            return message?.replace(/^Firebase: /, '').replace(/ \(.*\)\.$/, '') || 'An unexpected error occurred. Please try again.';
    }
}

/**
 * Returns true if the error is network-related.
 */
export function isNetworkError(error: unknown): boolean {
    const code: string = (error as any)?.code ?? '';
    const message: string = (error as any)?.message ?? '';
    return (
        code === 'auth/network-request-failed' ||
        code === 'unavailable' ||
        code === 'deadline-exceeded' ||
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('fetch')
    );
}

/**
 * Returns true if the error indicates the user needs to re-authenticate.
 */
export function requiresReAuth(error: unknown): boolean {
    return (error as any)?.code === 'auth/requires-recent-login';
}
