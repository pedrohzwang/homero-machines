export const theme = {
  colors: {
    // Backgrounds
    background: '#0a1628',
    surface: '#0f2035',
    surfaceLight: '#152a42',
    card: '#122338',

    // Primary / Accent
    primary: '#00bcd4',
    primaryDark: '#0097a7',
    primaryLight: '#26c6da',

    // Text
    text: '#e0e0e0',
    textSecondary: '#8899aa',
    textMuted: '#5a6a7a',
    textOnPrimary: '#0a1628',

    // Borders
    border: '#1a3550',
    borderLight: '#1e3a55',

    // Status
    danger: '#ef5350',
    dangerDark: '#c62828',
    success: '#4caf50',

    // Input
    inputBackground: '#0f2035',
    inputBorder: '#1a3550',
    placeholder: '#5a6a7a',

    // Header
    headerBackground: '#0a1628',
    headerText: '#00bcd4',

    // Search
    searchBackground: '#122338',
    searchBorder: '#1a3550',
    searchText: '#e0e0e0',
    searchPlaceholder: '#5a6a7a',

    // Badge
    badgeBackground: '#00bcd4',
    badgeText: '#0a1628',

    // FAB
    fabBackground: '#00bcd4',
    fabIcon: '#0a1628',

    // Overlay / Modal
    overlay: 'rgba(0, 0, 0, 0.6)',
    modalBackground: '#0f2035',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    round: 50,
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 26,
  },
} as const;

export type Theme = typeof theme;
