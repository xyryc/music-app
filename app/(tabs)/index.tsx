import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { StyledText } from "@/components/styled-text";
import { spacing } from "@/constants/design-system";
import { BookOpen, FolderOpen, Layers, Zap } from "lucide-react-native";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-6">
        <StyledText variant="title" weight="bold">
          Welcome Back
        </StyledText>
        <StyledText variant="body" className="text-gray-500 mt-1">
          Ready to build something amazing?
        </StyledText>
      </View>

      {/* Quick Actions */}
      <View className="px-6 mb-6">
        <StyledText variant="subtitle" weight="semibold" className="mb-4">
          Quick Actions
        </StyledText>
        <View className="gap-3">
          <Card>
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-xl bg-blue-500 items-center justify-center">
                <Zap size={24} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <View className="flex-1">
                <StyledText weight="semibold">Get Started</StyledText>
                <StyledText variant="caption" className="mt-0.5">
                  Start building your first feature
                </StyledText>
              </View>
              <Button size="sm" variant="outline">
                Go
              </Button>
            </View>
          </Card>

          <Card>
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-xl bg-purple-500 items-center justify-center">
                <BookOpen size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <StyledText weight="semibold">Learn More</StyledText>
                <StyledText variant="caption" className="mt-0.5">
                  Explore the documentation
                </StyledText>
              </View>
              <Button size="sm" variant="outline">
                View
              </Button>
            </View>
          </Card>
        </View>
      </View>

      {/* Stats Section */}
      <View className="px-6">
        <StyledText variant="subtitle" weight="semibold" className="mb-4">
          Overview
        </StyledText>
        <View className="flex-row gap-3">
          <Card className="flex-1 p-4 items-center">
            <FolderOpen size={28} color="#0A7EA4" />
            <StyledText variant="caption" className="mt-2">
              Projects
            </StyledText>
            <StyledText variant="title" weight="bold" className="mt-1">
              12
            </StyledText>
          </Card>
          <Card className="flex-1 p-4 items-center">
            <Layers size={28} color="#0A7EA4" />
            <StyledText variant="caption" className="mt-2">
              Components
            </StyledText>
            <StyledText variant="title" weight="bold" className="mt-1">
              48
            </StyledText>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
