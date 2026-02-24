/**
 * PasswordStrength - Visual password strength indicator
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';
import { Text } from './Text';

interface Props {
  strength: 'weak' | 'medium' | 'strong';
}

const config = {
  weak: { bars: 1, color: '#FF4B4B', label: 'Weak' },
  medium: { bars: 2, color: '#FACC15', label: 'Medium' },
  strong: { bars: 3, color: '#4ADE80', label: 'Strong' },
};

export const PasswordStrength = ({ strength }: Props) => {
  const { colors } = useTheme();
  const { bars, color, label } = config[strength];

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i <= bars ? color : colors.border },
            ]}
          />
        ))}
      </View>
      <Text variant="caption" color={color}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  bars: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  bar: {
    width: 30,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
});
