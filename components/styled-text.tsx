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
  className = '',
  style,
  children,
  ...props
}: StyledTextProps) {
  // Check if a text color class is already provided in className
  const hasColorClass = className.includes('text-');

  const getVariantClasses = () => {
    switch (variant) {
      case 'title':
        return 'text-2xl';
      case 'subtitle':
        return 'text-lg';
      case 'caption':
        return 'text-sm text-gray-500 dark:text-gray-400';
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

  // Only add a default text color if none is provided
  const defaultColorClass = hasColorClass ? '' : 'text-gray-900 dark:text-gray-100';

  return (
    <Text
      className={`${defaultColorClass} ${getVariantClasses()} ${getWeightClasses()} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
