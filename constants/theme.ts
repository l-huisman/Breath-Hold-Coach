/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E1E1E',
    textMuted: '#404040',
    background: '#FFFFFF',
    primary: '#284EA6',
    primaryMuted: '#93A6D3',
    accent: '#FF4B3E',
    // Legacy compatibility
    tint: '#284EA6',
    icon: '#93A6D3',
    tabIconDefault: '#93A6D3',
    tabIconSelected: '#284EA6',
  },
  // Dark theme not yet designed
  dark: {
    text: '#1E1E1E',
    textMuted: '#404040',
    background: '#FFFFFF',
    primary: '#284EA6',
    primaryMuted: '#93A6D3',
    accent: '#FF4B3E',
    // Legacy compatibility
    tint: '#284EA6',
    icon: '#93A6D3',
    tabIconDefault: '#93A6D3',
    tabIconSelected: '#284EA6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
