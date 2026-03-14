import React, { useState, useCallback } from 'react';
import { View, Text, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
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
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SlideData {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
}

const slides: SlideData[] = [
  {
    id: 0,
    title: 'Welcome to Qwen App',
    description: 'Your AI-powered assistant for building amazing mobile experiences with Expo and React Native.',
    icon: '👋',
    gradient: ['from-blue-500', 'to-cyan-400'],
  },
  {
    id: 1,
    title: 'Build Faster',
    description: 'Leverage AI assistance to write code, fix bugs, and implement features in record time.',
    icon: '⚡',
    gradient: ['from-purple-500', 'to-pink-400'],
  },
  {
    id: 2,
    title: 'Ready to Start',
    description: 'Everything is set up and ready to go. Let\'s build something amazing together!',
    icon: '🚀',
    gradient: ['from-orange-500', 'to-red-400'],
  },
];

interface PaginationDotProps {
  isActive: boolean;
  index: number;
  currentIndex: number;
}

function PaginationDot({ isActive, index, currentIndex }: PaginationDotProps) {
  const scale = useSharedValue(isActive ? 1.2 : 1);
  const width = useSharedValue(8);

  React.useEffect(() => {
    // Animation timing function: withSpring for natural, physics-based movement
    scale.value = withSpring(isActive ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
    width.value = withSpring(isActive ? 24 : 8, {
      damping: 15,
      stiffness: 150,
    });
  }, [isActive, scale, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    width: width.value,
  }));

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
      className={isActive ? 'bg-white' : 'bg-white/50'}
    />
  );
}

interface WelcomeSlideProps {
  slide: SlideData;
  isActive: boolean;
  direction: 'left' | 'right';
}

function WelcomeSlide({ slide, isActive, direction }: WelcomeSlideProps) {
  const rotateValue = useSharedValue(0);
  const bounceValue = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      rotateValue.value = withTiming(0, { duration: 600 });
      bounceValue.value = withSpring(0, { damping: 10, stiffness: 80 });
    }
  }, [isActive, rotateValue, bounceValue]);

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
        {/* Icon with gradient background */}
        <Animated.View
          style={iconAnimatedStyle}
          className={`w-40 h-40 rounded-full items-center justify-center mb-8 bg-gradient-to-br ${slide.gradient[0]} ${slide.gradient[1]} shadow-2xl`}
        >
          <Text className="text-6xl">{slide.icon}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={SlideInRight.delay(200).duration(500).springify()}
          exiting={SlideOutLeft.duration(300)}
          className="text-3xl font-bold text-white text-center mb-4"
        >
          {slide.title}
        </Animated.Text>

        {/* Description */}
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
  const translateX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = width * 0.2;

      if (e.translationX < -threshold && currentSlide < slides.length - 1) {
        // Swipe left - next slide
        setCurrentSlide((prev) => prev + 1);
      } else if (e.translationX > threshold && currentSlide > 0) {
        // Swipe right - previous slide
        setCurrentSlide((prev) => prev - 1);
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 100 });
    });

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Navigate to home
      router.replace('/(tabs)');
    }
  }, [currentSlide, router]);

  const handleSkip = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        {/* Skip button */}
        <View className="absolute top-12 right-4 z-10">
          <Animated.Text
            entering={FadeIn.delay(500)}
            exiting={FadeOut}
            onPress={handleSkip}
            className="text-white/80 text-base font-semibold px-4 py-2"
          >
            Skip
          </Animated.Text>
        </View>

        {/* Slides container */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={containerAnimatedStyle}
            className="flex-1 flex-row"
          >
            {slides.map((slide, index) => (
              <View key={slide.id} className="flex-1" style={{ width }}>
                {(index === currentSlide - 1 ||
                  index === currentSlide ||
                  index === currentSlide + 1) && (
                  <WelcomeSlide
                    slide={slide}
                    isActive={index === currentSlide}
                    direction={index < currentSlide ? 'left' : 'right'}
                  />
                )}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>

        {/* Bottom section with pagination and button */}
        <View className="pb-16 px-8">
          {/* Pagination dots */}
          <View className="flex-row items-center justify-center mb-8">
            {slides.map((_, index) => (
              <PaginationDot
                key={index}
                isActive={index === currentSlide}
                index={index}
                currentIndex={currentSlide}
              />
            ))}
          </View>

          {/* Progress bar */}
          <View className="h-1 bg-white/20 rounded-full mb-8 overflow-hidden">
            <Animated.View
              className="h-full bg-white rounded-full"
              style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`,
              }}
            />
          </View>

          {/* CTA Button */}
          <GestureDetector
            gesture={Gesture.Tap().onEnd(handleNext)}
          >
            <Animated.View
              entering={ZoomIn.delay(600).duration(400).springify()}
              className="bg-white rounded-2xl py-4 px-8 shadow-lg active:scale-95"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-lg font-bold text-purple-600 mr-2">
                  {currentSlide === slides.length - 1 ? "Let's Go!" : 'Next'}
                </Text>
                <Animated.Text
                  className="text-xl"
                >
                  {currentSlide === slides.length - 1 ? '🎉' : '→'}
                </Animated.Text>
              </View>
            </Animated.View>
          </GestureDetector>

          {/* Slide counter */}
          <View className="items-center mt-4">
            <Text className="text-white/60 text-sm">
              {currentSlide + 1} of {slides.length}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
