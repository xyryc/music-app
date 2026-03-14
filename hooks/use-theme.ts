import { useColorScheme } from 'react-native';
import { colors } from '@/constants/design-system';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  return {
    colors: colors[colorScheme],
    isDark: colorScheme === 'dark',
    colorScheme,
  };
}
