import React from 'react';
import { Text, TextProps } from 'react-native';

interface StyledTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption' | 'body';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export function StyledText({
  variant = 'default',
  weight = 'regular',
  style,
  children,
  ...props
}: StyledTextProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'title':
        return 'text-2xl';
      case 'subtitle':
        return 'text-lg';
      case 'caption':
        return 'text-sm text-gray-500';
      case 'body':
        return 'text-base leading-relaxed';
      default:
        return 'text-base';
    }
  };

  const getWeightClasses = () => {
    switch (weight) {
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      default:
        return 'font-normal';
    }
  };

  return (
    <Text
      className={`text-foreground ${getVariantClasses()} ${getWeightClasses()}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
