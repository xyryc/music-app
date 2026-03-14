import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { spacing, borderRadius } from '@/constants/design-system';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'card' | 'section';
  padding?: keyof typeof spacing;
  radius?: keyof typeof borderRadius;
  children?: React.ReactNode;
}

export function ThemedView({
  variant = 'default',
  padding,
  radius,
  style,
  children,
  ...props
}: ThemedViewProps) {
  const { colors } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          ...styles.cardShadow,
        };
      case 'section':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        getVariantStyle(),
        padding && { padding: spacing[padding] },
        radius && { borderRadius: borderRadius[radius] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
