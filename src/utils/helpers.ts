/**
 * ChatBox Utility Functions
 */

/**
 * Map Firebase Auth error codes to user-friendly messages
 */
export function getFirebaseAuthError(error: any): string {
  const code = error?.code || error?.message || '';
  const errorMap: Record<string, string> = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/requires-recent-login': 'Please log in again before performing this action.',
    'auth/credential-already-in-use': 'This credential is already linked to another account.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Verification session expired. Please request a new code.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/phone-number-already-exists': 'This phone number is already registered.',
    'auth/invalid-phone-number': 'Please enter a valid phone number with country code.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method.',
  };
  return errorMap[code] || error?.message || 'An unexpected error occurred. Please try again.';
}

export function formatTime(dateStr: string | number | Date | any): string {
  const date = toDate(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diff < 2 * dayMs) return 'Yesterday';
  if (diff < 7 * dayMs) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateStr: string | number | Date | any): string {
  const date = toDate(dateStr);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}w ago`;
  return formatTime(dateStr);
}

/** Safely convert any date-like value (including Firestore Timestamp) to a JS Date. */
function toDate(value: any): Date {
  if (!value) return new Date(NaN);
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return new Date(value);
}

export function formatMessageTime(timestamp: any): string {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('At least one special character');

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length <= 2) strength = 'medium';
  if (errors.length === 0) strength = 'strong';

  return { isValid: errors.length === 0, strength, errors };
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3) return { isValid: false, error: 'At least 3 characters' };
  if (username.length > 20) return { isValid: false, error: 'Maximum 20 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { isValid: false, error: 'Only letters, numbers, and underscores' };
  return { isValid: true };
}

export function formatMemberCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online': return '#4ADE80';
    case 'away':
    case 'idle': return '#FACC15';
    case 'busy':
    case 'dnd': return '#FF4B4B';
    default: return '#6B7280';
  }
}

export function formatChannelName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function groupMessagesByDate(messages: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  for (const msg of messages) {
    const date = new Date(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  }
  return groups;
}

export function shouldGroupMessages(prev: any, curr: any): boolean {
  if (!prev || !curr) return false;
  if (prev.authorId !== curr.authorId) return false;
  const prevTime = prev.createdAt?.seconds ? prev.createdAt.seconds * 1000 : new Date(prev.createdAt).getTime();
  const currTime = curr.createdAt?.seconds ? curr.createdAt.seconds * 1000 : new Date(curr.createdAt).getTime();
  const diff = currTime - prevTime;
  return diff < 300000; // 5 minutes
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}
