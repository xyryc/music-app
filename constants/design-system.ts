/**
 * Design System - Expo App Design Skill
 * 
 * Guidelines applied:
 * - Semantic colors for light/dark mode
 * - Consistent spacing scale (4px base)
 * - Sufficient contrast ratios (WCAG AA)
 * - Platform conventions respected
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const colors = {
  light: {
    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    
    // Brand
    primary: '#0A7EA4',
    primaryForeground: '#FFFFFF',
    secondary: '#7C3AED',
    secondaryForeground: '#FFFFFF',
    
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // UI Elements
    border: '#E5E7EB',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Tab Bar
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#0A7EA4',
  },
  dark: {
    // Background
    background: '#0F0F0F',
    backgroundSecondary: '#1A1A1A',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    
    // Brand
    primary: '#0EA5E9',
    primaryForeground: '#0F0F0F',
    secondary: '#A78BFA',
    secondaryForeground: '#0F0F0F',
    
    // Semantic
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // UI Elements
    border: '#27272A',
    card: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Tab Bar
    tabIconDefault: '#6B7280',
    tabIconSelected: '#0EA5E9',
  },
} as const;

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;
