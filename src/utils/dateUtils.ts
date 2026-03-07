import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Converts a Firebase Timestamp, JS Date, ISO string, or epoch number to a JS Date.
 */
export function toDate(value: Timestamp | Date | string | number | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return null;
}

/**
 * Returns a relative time string (e.g. "2 minutes ago") for recent timestamps,
 * or a formatted date string for older ones.
 */
export function formatRelativeDate(value: Timestamp | Date | string | number | null | undefined): string {
    const date = toDate(value);
    if (!date) return '';

    if (isToday(date)) {
        const diff = Date.now() - date.getTime();
        // Within 60 seconds → "Just now"
        if (diff < 60_000) return 'Just now';
        // Within 1 hour → "X minutes ago"
        if (diff < 3_600_000) return formatDistanceToNow(date, { addSuffix: true });
        // Today → HH:mm
        return format(date, 'HH:mm');
    }

    if (isYesterday(date)) return 'Yesterday';

    // This week → Mon, Tue, etc.
    if (Date.now() - date.getTime() < 7 * 24 * 3_600_000) {
        return format(date, 'EEE');
    }

    // Older → DD/MM/YYYY
    return format(date, 'dd/MM/yyyy');
}

/**
 * Returns a full date-time string for notification timestamps.
 */
export function formatFullDate(value: Timestamp | Date | string | number | null | undefined): string {
    const date = toDate(value);
    if (!date) return '';
    return format(date, 'dd MMM yyyy, HH:mm');
}
