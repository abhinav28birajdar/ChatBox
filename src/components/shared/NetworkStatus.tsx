import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';

interface NetworkStatusProps {
  children: React.ReactNode;
}

/**
 * Monitors network connectivity and shows a banner overlay when offline.
 * Children are NEVER unmounted — the offline banner overlays on top.
 */
export function NetworkStatus({ children }: NetworkStatusProps) {
  const { colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      await fetch('https://connectivitycheck.gstatic.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkConnection, 30000);
    checkConnection();
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <View style={styles.root}>
      {children}
      {isOffline && (
        <View style={[styles.overlay, { backgroundColor: colors.background + 'F5' }]}>
          <View style={styles.content}>
            <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="cloud-offline-outline" size={64} color={colors.error} />
            </View>
            <Text variant="h2" style={styles.title}>No Internet Connection</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
              Please check your network settings and try again.
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              onPress={checkConnection}
              disabled={checking}
            >
              <Ionicons name="refresh" size={20} color={colors.background} />
              <Text variant="button" color={colors.background} style={{ marginLeft: 8 }}>
                {checking ? 'Checking...' : 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
});
