import { Card } from "@/components/card";
import { StyledText } from "@/components/styled-text";
import { spacing } from "@/constants/design-system";
import { Film, Palette, Puzzle, Smartphone, Zap } from "lucide-react-native";
import { ScrollView, View } from "react-native";

const features = [
  {
    icon: Palette,
    title: "Design System",
    description: "Semantic colors, spacing, and typography for consistent UI",
  },
  {
    icon: Puzzle,
    title: "Reusable Components",
    description: "Button, Card, StyledText components",
  },
  {
    icon: Zap,
    title: "NativeWind v4",
    description: "Tailwind CSS styling with full TypeScript support",
  },
  {
    icon: Film,
    title: "Animations",
    description: "Reanimated 3 and Gesture Handler for smooth animations",
  },
  {
    icon: Smartphone,
    title: "Expo Router",
    description: "File-based routing with native navigation patterns",
  },
];

export default function ExploreScreen() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-6">
        <StyledText variant="title" weight="bold">
          Explore
        </StyledText>
        <StyledText variant="body" className="text-gray-500 mt-1">
          Discover what is included in this starter
        </StyledText>
      </View>

      {/* Features Grid */}
      <View className="px-6 gap-3">
        {features.map((feature, index) => (
          <Card key={index} variant="elevated">
            <View className="flex-row gap-4">
              <View className="w-14 h-14 rounded-xl bg-purple-500 items-center justify-center">
                <feature.icon size={28} color="#FFFFFF" />
              </View>
              <View className="flex-1 justify-center">
                <StyledText weight="semibold" className="mb-1">
                  {feature.title}
                </StyledText>
                <StyledText variant="caption" className="text-gray-500">
                  {feature.description}
                </StyledText>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
