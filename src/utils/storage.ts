/**
 * AsyncStorage wrapper with typed keys
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  AUTH_TOKEN: 'chatbox_auth_token',
  REFRESH_TOKEN: 'chatbox_refresh_token',
  USER_DATA: 'chatbox_user_data',
  THEME: 'chatbox_theme',
  ONBOARDING_COMPLETE: 'chatbox_onboarding_complete',
  REMEMBER_ME: 'chatbox_remember_me',
  DRAFT_PREFIX: 'chatbox_draft_',
  SEARCH_HISTORY: 'chatbox_search_history',
  NOTIFICATION_TOKEN: 'chatbox_notification_token',
  APP_SETTINGS: 'chatbox_app_settings',
} as const;

export async function setItem(key: string, value: any): Promise<void> {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Storage setItem error:', e);
  }
}

export async function getItem<T = string>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (e) {
    console.error('Storage getItem error:', e);
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Storage removeItem error:', e);
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('Storage clearAll error:', e);
  }
}

export async function saveDraft(channelId: string, text: string): Promise<void> {
  await setItem(`${StorageKeys.DRAFT_PREFIX}${channelId}`, text);
}

export async function getDraft(channelId: string): Promise<string | null> {
  return getItem(`${StorageKeys.DRAFT_PREFIX}${channelId}`);
}

export async function addSearchHistory(query: string): Promise<void> {
  const history = (await getItem<string[]>(StorageKeys.SEARCH_HISTORY)) || [];
  const updated = [query, ...history.filter(h => h !== query)].slice(0, 20);
  await setItem(StorageKeys.SEARCH_HISTORY, updated);
}

export async function getSearchHistory(): Promise<string[]> {
  return (await getItem<string[]>(StorageKeys.SEARCH_HISTORY)) || [];
}
