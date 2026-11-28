import React from 'react';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// UI-thread Reanimated + Gesture Handler card wrapper
export default function AnimatedCard({ children, delay = 0, onPress, style }) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onBegin(() => {
      if (!reducedMotion) scale.value = withSpring(0.97, { damping: 15, stiffness: 220 });
    })
    .onFinalize(() => {
      if (!reducedMotion) scale.value = withSpring(1, { damping: 15, stiffness: 220 });
    })
    .onEnd(() => {
      if (onPress) onPress();
    });

  const entering = reducedMotion
    ? undefined
    : FadeInDown.delay(delay).duration(320).springify().damping(18);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View entering={entering} style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
