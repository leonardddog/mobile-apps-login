/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  // Fira Sans family - PostScript names from @expo-google-fonts/fira-sans
  // All text uses Fira Sans per design requirement
  regular: 'FiraSans_400Regular',
  medium: 'FiraSans_500Medium',
  semiBold: 'FiraSans_600SemiBold',
  bold: 'FiraSans_700Bold',
  // Legacy keys mapped to Fira Sans for compatibility
  sans: 'FiraSans_400Regular',
  sansMedium: 'FiraSans_500Medium',
  sansSemiBold: 'FiraSans_600SemiBold',
  sansBold: 'FiraSans_700Bold',
  serif: 'FiraSans_400Regular',
  rounded: 'FiraSans_400Regular',
  mono: 'FiraSans_400Regular',
} as const;

// Keep Platform.select wrapper for future web-specific overrides if needed
export const PlatformFonts = Platform.select({
  ios: Fonts,
  default: Fonts,
  web: {
    ...Fonts,
    sans: 'var(--font-display)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
