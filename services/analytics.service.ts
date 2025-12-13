/**
 * Analytics Service
 * Scaffold for analytics tracking (ready for Firebase, Amplitude, etc.)
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface UserProperties {
  userId?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

export class AnalyticsService {
  private enabled: boolean = true;
  private userProperties: UserProperties = {};
  private eventQueue: AnalyticsEvent[] = [];

  /**
   * Initialize analytics with user
   */
  async initialize(userId?: string) {
    if (userId) {
      this.setUserProperty('userId', userId);
    }
  }

  /**
   * Track an event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        ...this.userProperties,
      },
      timestamp: Date.now(),
    };

    this.eventQueue.push(event);

    // TODO: Send to analytics service
    // For now, just log in development
    if (__DEV__) {
      // Event tracked silently
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, any>) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Set user property
   */
  setUserProperty(key: string, value: any) {
    this.userProperties[key] = value;
  }

  /**
   * Set multiple user properties
   */
  setUserProperties(properties: UserProperties) {
    this.userProperties = {
      ...this.userProperties,
      ...properties,
    };
  }

  /**
   * Clear user properties (on logout)
   */
  clearUser() {
    this.userProperties = {};
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Predefined events for common actions
  trackSignUp(method: string) {
    this.trackEvent('sign_up', { method });
  }

  trackSignIn(method: string) {
    this.trackEvent('sign_in', { method });
  }

  trackSignOut() {
    this.trackEvent('sign_out');
  }

  trackMessageSent(chatType: 'direct' | 'group', messageType: string) {
    this.trackEvent('message_sent', { chat_type: chatType, message_type: messageType });
  }

  trackChatCreated(chatType: 'direct' | 'group', memberCount: number) {
    this.trackEvent('chat_created', { chat_type: chatType, member_count: memberCount });
  }

  trackProfileUpdated(fields: string[]) {
    this.trackEvent('profile_updated', { fields });
  }

  trackFileUploaded(fileType: string, size: number) {
    this.trackEvent('file_uploaded', { file_type: fileType, size_bytes: size });
  }

  trackError(errorType: string, errorMessage: string) {
    this.trackEvent('error_occurred', { error_type: errorType, error_message: errorMessage });
  }
}

export const analyticsService = new AnalyticsService();
