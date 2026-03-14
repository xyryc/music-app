import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Hand,
  Rocket,
  SkipForward,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface SlideData {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  gradient: [string, string];
}

const slides: SlideData[] = [
  {
    id: 0,
    title: "Welcome to Qwen App",
    description:
      "Your AI-powered assistant for building amazing mobile experiences with Expo and React Native.",
    icon: Hand,
    gradient: ["#3B82F6", "#22D3EE"],
  },
  {
    id: 1,
    title: "Build Faster",
    description:
      "Leverage AI assistance to write code, fix bugs, and implement features in record time.",
    icon: Zap,
    gradient: ["#A855F7", "#EC4899"],
  },
  {
    id: 2,
    title: "Ready to Start",
    description:
      "Everything is set up and ready to go. Let's build something amazing together!",
    icon: Rocket,
    gradient: ["#F97316", "#EF4444"],
  },
];

interface PaginationDotProps {
  isActive: boolean;
}

function PaginationDot({ isActive }: PaginationDotProps) {
  const scale = useSharedValue(1);
  const dotWidth = useSharedValue(8);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
    dotWidth.value = withSpring(isActive ? 24 : 8, {
      damping: 15,
      stiffness: 150,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    width: dotWidth.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`h-2 rounded-full mx-1 ${isActive ? "bg-white" : "bg-white/50"}`}
    />
  );
}

interface WelcomeSlideProps {
  slide: SlideData;
  isActive: boolean;
}

function WelcomeSlide({ slide, isActive }: WelcomeSlideProps) {
  const rotateValue = useSharedValue(0);
  const bounceValue = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      rotateValue.value = withTiming(0, { duration: 600 });
      bounceValue.value = withSpring(0, { damping: 10, stiffness: 80 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotateValue.value}deg` },
      { translateY: Math.sin(bounceValue.value) * 10 },
    ],
  }));

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View
        entering={ZoomIn.duration(600).springify()}
        exiting={FadeOut.duration(300)}
        className="items-center"
      >
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-40 h-40 rounded-full items-center justify-center mb-8 shadow-2xl"
        >
          <Animated.View style={iconAnimatedStyle}>
            <slide.icon size={48} color="#FFFFFF" />
          </Animated.View>
        </LinearGradient>

        <Animated.Text
          entering={SlideInRight.delay(200).duration(500).springify()}
          exiting={SlideOutLeft.duration(300)}
          className="text-3xl font-bold text-white text-center mb-4"
        >
          {slide.title}
        </Animated.Text>

        <Animated.Text
          entering={FadeIn.delay(400).duration(600)}
          exiting={FadeOut.duration(300)}
          className="text-lg text-white/90 text-center leading-relaxed"
        >
          {slide.description}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const buttonScale = useSharedValue(1);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      router.replace("/(tabs)");
    }
  }, [currentSlide, router]);

  const handleSkip = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#2563EB", "#7C3AED", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView className="flex-1">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10 flex-row items-center"
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text className="text-white/80 text-base font-semibold mr-1">
              Skip
            </Text>
            <SkipForward size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <View className="flex-1 relative overflow-hidden">
            {slides.map((slide, index) => (
              <Animated.View
                key={slide.id}
                className="absolute inset-0 w-full h-full"
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                  transform: [
                    {
                      translateX:
                        index < currentSlide
                          ? -width * 0.3
                          : index > currentSlide
                            ? width * 0.3
                            : 0,
                    },
                  ],
                }}
                pointerEvents={index === currentSlide ? "auto" : "none"}
              >
                <WelcomeSlide
                  slide={slide}
                  isActive={slide.id === currentSlide}
                />
              </Animated.View>
            ))}
          </View>

          <View className="pb-16 px-6">
            <View className="flex-row items-center justify-center mb-8">
              {slides.map((_, index) => (
                <PaginationDot key={index} isActive={index === currentSlide} />
              ))}
            </View>

            <View className="h-1 bg-white/20 rounded-full mb-6 overflow-hidden">
              <Animated.View
                className="h-full bg-white rounded-full"
                style={{
                  width: `${((currentSlide + 1) / slides.length) * 100}%`,
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              onPressIn={() => {
                buttonScale.value = withSpring(0.95, {
                  damping: 15,
                  stiffness: 200,
                });
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1, {
                  damping: 15,
                  stiffness: 200,
                });
              }}
            >
              <Animated.View
                entering={ZoomIn.delay(600).duration(400).springify()}
                style={buttonAnimatedStyle}
                className="bg-white rounded-2xl py-4 px-8 shadow-lg"
              >
                <View className="flex-row items-center justify-center">
                  <Text className="text-lg font-bold text-purple-600 mr-2">
                    {currentSlide === slides.length - 1 ? "Let's Go!" : "Next"}
                  </Text>
                  {currentSlide === slides.length - 1 ? (
                    <Zap size={20} color="#7C3AED" fill="#7C3AED" />
                  ) : (
                    <ChevronRight size={20} color="#7C3AED" />
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>

            <View className="items-center mt-4">
              <Text className="text-white/60 text-sm">
                {currentSlide + 1} of {slides.length}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
