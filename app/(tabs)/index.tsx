import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/constants/design-system';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
      {/* Header */}
      <View style={{ padding: spacing.xl, paddingTop: spacing['3xl'] }}>
        <ThemedText variant="title" weight="bold">
          Welcome Back
        </ThemedText>
        <ThemedText variant="body" style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          Ready to build something amazing?
        </ThemedText>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing['2xl'] }}>
        <ThemedText variant="subtitle" style={{ marginBottom: spacing.lg }}>
          Quick Actions
        </ThemedText>
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText style={{ color: colors.primaryForeground, fontSize: 24 }}>⚡</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText weight="semibold">Get Started</ThemedText>
                <ThemedText variant="caption" style={{ marginTop: 2 }}>
                  Start building your first feature
                </ThemedText>
              </View>
              <Button size="sm" variant="outline">
                Go
              </Button>
            </View>
          </Card>

          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText style={{ color: colors.secondaryForeground, fontSize: 24 }}>📚</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText weight="semibold">Learn More</ThemedText>
                <ThemedText variant="caption" style={{ marginTop: 2 }}>
                  Explore the documentation
                </ThemedText>
              </View>
              <Button size="sm" variant="outline">
                View
              </Button>
            </View>
          </Card>
        </View>
      </View>

      {/* Stats Section */}
      <View style={{ paddingHorizontal: spacing.xl }}>
        <ThemedText variant="subtitle" style={{ marginBottom: spacing.lg }}>
          Overview
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Card style={{ flex: 1 }} padding="xl">
            <ThemedText variant="caption">Projects</ThemedText>
            <ThemedText variant="title" weight="bold" style={{ marginTop: spacing.sm }}>
              12
            </ThemedText>
          </Card>
          <Card style={{ flex: 1 }} padding="xl">
            <ThemedText variant="caption">Components</ThemedText>
            <ThemedText variant="title" weight="bold" style={{ marginTop: spacing.sm }}>
              48
            </ThemedText>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
