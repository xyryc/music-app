---
name: react-native-animations
description: Master animations - Reanimated 3, Gesture Handler, layout animations, and performance optimization
version: 2.0.0
---

# React Native Animations

Master animations with Reanimated 3, Gesture Handler, layout animations, and performance optimization.

## Prerequisites
- React Native basics
- Understanding of JavaScript closures
- Familiarity with transforms and styles

## Learning Objectives
After completing this skill, you will be able to:
- Create smooth 60fps animations with Reanimated
- Handle complex gestures with Gesture Handler
- Implement layout entering/exiting animations
- Optimize animations for performance
- Combine gestures with animations

## Installation

```bash
npm install react-native-reanimated react-native-gesture-handler
```

```javascript
// babel.config.js
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

## Reanimated Basics

```javascript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function AnimatedBox() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(scale.value === 1 ? 1.5 : 1);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </Pressable>
  );
}
```

## Gesture Handler

```javascript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.box, style]} />
    </GestureDetector>
  );
}
```

## Layout Animations

```javascript
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

function AnimatedList({ items }) {
  return (
    <Animated.View layout={Layout.springify()}>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeIn}
          exiting={FadeOut}
          layout={Layout.springify()}
        >
          <Text>{item.title}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}
```

## Animation Timing Functions

| Function | Use Case |
|----------|----------|
| `withTiming` | Linear, controlled duration |
| `withSpring` | Natural, physics-based |
| `withDecay` | Momentum-based (fling) |
| `withSequence` | Multiple animations in order |
| `withRepeat` | Looping animations |

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Attempted to call from worklet" | Missing `runOnJS` | Wrap with `runOnJS()` |
| Animation not running | Missing `'worklet'` | Add `'worklet'` directive |
| Gesture not working | Missing root view | Add `GestureHandlerRootView` |

## Validation Checklist
- [ ] Animations run at 60fps
- [ ] Gestures respond smoothly
- [ ] No frame drops on low-end devices
- [ ] Layout animations don't cause jank
