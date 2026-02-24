/**
 * Modal Component - Bottom sheet style modals
 */
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal as RNModal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';
import { Text } from './Text';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoint?: 'quarter' | 'half' | 'full';
  showHandle?: boolean;
}

export const BottomSheet = ({
  visible,
  onClose,
  title,
  children,
  snapPoint = 'half',
  showHandle = true,
}: Props) => {
  const { colors } = useTheme();

  const getHeight = () => {
    switch (snapPoint) {
      case 'quarter': return SCREEN_HEIGHT * 0.3;
      case 'half': return SCREEN_HEIGHT * 0.55;
      case 'full': return SCREEN_HEIGHT * 0.9;
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            maxHeight: getHeight(),
          },
        ]}
      >
        {showHandle && <View style={[styles.handle, { backgroundColor: colors.border }]} />}
        {title && (
          <View style={styles.header}>
            <Text variant="subtitle1">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </RNModal>
  );
};

interface ActionSheetOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export const ActionSheet = ({ visible, onClose, title, options }: ActionSheetProps) => {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} snapPoint="quarter">
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.actionItem, { borderBottomColor: colors.border }]}
          onPress={() => {
            option.onPress();
            onClose();
          }}
        >
          <Ionicons
            name={option.icon}
            size={22}
            color={option.destructive ? colors.error : option.color || colors.text}
          />
          <Text
            variant="body"
            color={option.destructive ? colors.error : colors.text}
            style={styles.actionLabel}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionLabel: {
    marginLeft: Spacing.md,
  },
});
