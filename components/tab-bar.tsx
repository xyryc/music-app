import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  insets: { top: number; right: number; bottom: number; left: number };
}

export function TabBar({
  state,
  descriptors,
  navigation,
  insets,
}: TabBarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const tabPositions = useRef<number[]>([]);
  const tabWidths = useRef<number[]>([]);
  const indicatorX = useSharedValue(0);

  const PILL_WIDTH = 80;

  const getPillOffset = (tabIndex: number) => {
    const x = tabPositions.current[tabIndex] ?? 0;
    const w = tabWidths.current[tabIndex] ?? 0;
    return x + (w - PILL_WIDTH) / 2;
  };

  useEffect(() => {
    indicatorX.value = withTiming(getPillOffset(state.index), {
      duration: 250,
    });
  }, [state.index]);

  const handleLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabPositions.current[index] = x;
    tabWidths.current[index] = width;
    if (index === state.index) {
      indicatorX.value = getPillOffset(index);
    }
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const barBg = isDark ? "rgba(22, 30, 42, 0.94)" : "rgba(240, 242, 248, 0.94)";
  const activeColor = "#0A7EA4";
  const inactiveColor = isDark ? "#6B7B8D" : "#8E8E93";
  const activePillBg = isDark
    ? "rgba(10, 126, 164, 0.18)"
    : "rgba(10, 126, 164, 0.13)";

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: isDark ? 0.25 : 0.07,
      shadowRadius: 8,
    },
    android: {
      elevation: 12,
    },
  });

  return (
    <View
      style={[
        {
          backgroundColor: barBg,
          paddingBottom: insets.bottom,
        },
        shadowStyle,
      ]}
    >
      <View style={{ height: 64, position: "relative", flexDirection: "row" }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 6,
              bottom: 6,
              width: PILL_WIDTH,
              borderRadius: 20,
              backgroundColor: activePillBg,
            },
            animatedIndicatorStyle,
          ]}
        />
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const iconColor = isFocused ? activeColor : inactiveColor;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={(e) => handleLayout(index, e)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: iconColor,
                size: 24,
              })}
              <Text
                style={{
                  fontSize: 10,
                  letterSpacing: 0.2,
                  color: iconColor,
                  marginTop: 3,
                  fontWeight: isFocused ? "600" : "500",
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
