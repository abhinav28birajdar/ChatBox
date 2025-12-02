/**
 * Modal Component
 * Modern modal with backdrop and animations
 */

import { borderRadius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    Dimensions,
    Modal as RNModal,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom' | 'top';
  showBackdrop?: boolean;
  backdropOpacity?: number;
  closeOnBackdrop?: boolean;
  closeOnBackButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  style?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  children,
  size = 'md',
  position = 'center',
  showBackdrop = true,
  backdropOpacity = 0.5,
  closeOnBackdrop = true,
  closeOnBackButton = true,
  animationType = 'fade',
  style,
}: ModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && closeOnBackButton) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, closeOnBackButton, onClose]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: 320, maxHeight: screenHeight * 0.4 };
      case 'md':
        return { maxWidth: 400, maxHeight: screenHeight * 0.6 };
      case 'lg':
        return { maxWidth: 500, maxHeight: screenHeight * 0.8 };
      case 'full':
        return { width: '100%', height: '100%' };
      default:
        return { maxWidth: 400, maxHeight: screenHeight * 0.6 };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return {
          justifyContent: 'flex-end',
          paddingBottom: insets.bottom + spacing.md,
        };
      case 'top':
        return {
          justifyContent: 'flex-start',
          paddingTop: insets.top + spacing.md,
        };
      case 'center':
      default:
        return {
          justifyContent: 'center',
          alignItems: 'center',
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();

  const getAnimationProps = () => {
    if (position === 'bottom') {
      return {
        from: { translateY: 300, opacity: 0 },
        animate: { translateY: 0, opacity: 1 },
        exit: { translateY: 300, opacity: 0 },
      };
    }
    if (position === 'top') {
      return {
        from: { translateY: -300, opacity: 0 },
        animate: { translateY: 0, opacity: 1 },
        exit: { translateY: -300, opacity: 0 },
      };
    }
    return {
      from: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    };
  };

  const animationProps = getAnimationProps();

  return (
    <RNModal
      visible={modalVisible}
      transparent
      animationType={animationType}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, positionStyles]}>
        {/* Backdrop */}
        {showBackdrop && (
          <MotiView
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
              },
            ]}
            animate={{ opacity: visible ? backdropOpacity : 0 }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={closeOnBackdrop ? onClose : undefined}
              activeOpacity={1}
            />
          </MotiView>
        )}

        {/* Modal Content */}
        <MotiView
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.background,
              ...sizeStyles,
              ...theme.shadows.lg,
            },
            style,
          ]}
          {...animationProps}
          transition={{
            type: 'timing',
            duration: 250,
          }}
        >
          {children}
        </MotiView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  modal: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
});