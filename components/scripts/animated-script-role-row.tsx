import type { PropsWithChildren } from 'react';
import { useCallback, useRef } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ROLE_ROW_POSITION_ANIMATION_DURATION = 220;

type AnimatedScriptRoleRowProps = PropsWithChildren<{
  animateLayout?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function AnimatedScriptRoleRow({
  animateLayout = true,
  children,
  style,
}: AnimatedScriptRoleRowProps) {
  const previousY = useRef<number | null>(null);
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const handleLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const nextY = nativeEvent.layout.y;
      const currentY = previousY.current;
      previousY.current = nextY;

      if (currentY === null || currentY === nextY) {
        return;
      }

      translateY.value = currentY - nextY;
      translateY.value = withTiming(0, {
        duration: ROLE_ROW_POSITION_ANIMATION_DURATION,
      });
    },
    [translateY],
  );

  return (
    <Animated.View
      layout={animateLayout ? LinearTransition.duration(220) : undefined}
      onLayout={animateLayout ? undefined : handleLayout}
      style={animateLayout ? style : [style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}
