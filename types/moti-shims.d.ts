// Quick shim for Moti typing incompatibilities in this project
declare module 'moti' {
  import { ComponentType } from 'react';
    import { TextProps, ViewProps } from 'react-native';

  export const MotiView: ComponentType<ViewProps & any>;
  export const MotiText: ComponentType<TextProps & any>;
  export const AnimatePresence: ComponentType<any>;
  export type MotiTransitionProp = any;
}
