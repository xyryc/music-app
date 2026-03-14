import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/card';
import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/constants/design-system';

const features = [
  {
    icon: '🎨',
    title: 'Design System',
    description: 'Semantic colors, spacing, and typography for consistent UI',
  },
  {
    icon: '🧩',
    title: 'Reusable Components',
    description: 'Button, Card, ThemedText, and ThemedView components',
  },
  {
    icon: '🌙',
    title: 'Dark Mode',
    description: 'Full dark mode support with automatic theme switching',
  },
  {
    icon: '⚡',
    title: 'NativeWind v4',
    description: 'Tailwind CSS styling with full TypeScript support',
  },
  {
    icon: '🎬',
    title: 'Animations',
    description: 'Reanimated 3 and Gesture Handler for smooth animations',
  },
  {
    icon: '📱',
    title: 'Expo Router',
    description: 'File-based routing with native navigation patterns',
  },
];

export default function ExploreScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
      {/* Header */}
      <View style={{ padding: spacing.xl, paddingTop: spacing['3xl'], paddingBottom: spacing.xl }}>
        <ThemedText variant="title" weight="bold">
          Explore
        </ThemedText>
        <ThemedText variant="body" style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Discover what's included in this starter
        </ThemedText>
      </View>

      {/* Features Grid */}
      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        {features.map((feature, index) => (
          <Card key={index} variant="elevated">
            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText style={{ fontSize: 28 }}>{feature.icon}</ThemedText>
              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <ThemedText weight="semibold" style={{ marginBottom: spacing.xs }}>
                  {feature.title}
                </ThemedText>
                <ThemedText variant="caption" style={{ color: colors.textSecondary }}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
