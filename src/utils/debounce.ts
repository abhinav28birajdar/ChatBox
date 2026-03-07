/**
 * Returns a debounced version of `fn` that delays invocation by `ms` milliseconds.
 * Use this for search inputs, filter inputs, and any high-frequency callbacks
 * that trigger expensive operations (Firestore queries, network requests, etc.).
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return function (...args: Parameters<T>) {
        if (timer !== undefined) clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, ms);
    };
}

/**
 * Creates a throttled version of `fn` that only invokes the function at most
 * once per `ms` milliseconds. Useful for scroll-based handlers and real-time
 * presence updates.
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return function (...args: Parameters<T>) {
        const now = Date.now();
        if (now - lastCall >= ms) {
            lastCall = now;
            fn(...args);
        }
    };
}
