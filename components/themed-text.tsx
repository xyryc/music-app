import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { typography } from '@/constants/design-system';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption' | 'body';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export function ThemedText({
  variant = 'default',
  weight = 'regular',
  style,
  children,
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const getTextStyle = () => {
    switch (variant) {
      case 'title':
        return { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold };
      case 'subtitle':
        return { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold };
      case 'caption':
        return { fontSize: typography.fontSize.sm, color: colors.textMuted };
      case 'body':
        return { fontSize: typography.fontSize.md, lineHeight: typography.fontSize.md * typography.lineHeight.relaxed };
      default:
        return { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight[weight] };
    }
  };

  return (
    <Text
      style={[
        { color: colors.text },
        getTextStyle(),
        { fontWeight: typography.fontWeight[weight] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
