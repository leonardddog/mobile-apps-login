/**
 * Light-only theme. The app forces `userInterfaceStyle: "light"`
 * (see app.json), so there is no dark palette.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  text: '#000000',
  background: '#ffffff',
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  textSecondary: '#545E6B',
} as const;

export type ThemeColor = keyof typeof Colors;

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
// Web uses CSS 'Fira Sans' name (loaded via expo-font @font-face),
// native uses PostScript names from @expo-google-fonts/fira-sans.
export const PlatformFonts = Platform.select({
  ios: Fonts,
  default: Fonts,
  web: {
    regular: 'Fira Sans',
    medium: 'Fira Sans',
    semiBold: 'Fira Sans',
    bold: 'Fira Sans',
    sans: 'Fira Sans',
    sansMedium: 'Fira Sans',
    sansSemiBold: 'Fira Sans',
    sansBold: 'Fira Sans',
    serif: 'Fira Sans',
    rounded: 'Fira Sans',
    mono: 'Fira Sans',
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
