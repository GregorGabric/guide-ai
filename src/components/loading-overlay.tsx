import { Sparkles } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Scale up animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: true,
    }).start();

    // Smooth continuous rotation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Dots animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [dotsAnim, fadeAnim, scaleAnim, spinAnim]);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      className="absolute inset-0 z-50 items-center justify-center"
      style={{ opacity: fadeAnim }}
    >
      {/* Minimal background blur */}
      <View className="bg-background/95 absolute inset-0" />

      <Animated.View
        className="bg-surface border-divider/20 mx-8 items-center justify-center rounded-3xl border p-8"
        style={{
          transform: [{ scale: scaleAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 8,
        }}
      >
        {/* Simplified loading indicator */}
        <View className="relative mb-6">
          <Animated.View
            className="bg-primary/10 h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              transform: [{ rotate: rotation }],
            }}
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </Animated.View>
        </View>

        {/* Clean loading text */}
        <Text
          className="text-text font-quicksand-bold mb-3 text-center text-lg"
          style={{ letterSpacing: -0.2 }}
        >
          {message}
        </Text>

        {/* Minimal loading dots */}
        <View className="flex-row items-center space-x-1.5">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              className="bg-text-tertiary h-1.5 w-1.5 rounded-full"
              style={{
                opacity: dotsAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: index === 1 ? [0.3, 1, 0.3] : [0.3, 0.6, 0.3],
                }),
                transform: [
                  {
                    scale: dotsAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: index === 1 ? [1, 1.4, 1] : [1, 1.2, 1],
                    }),
                  },
                ],
              }}
            />
          ))}
        </View>

        {/* Minimal description */}
        <Text
          className="text-text-tertiary font-quicksand mt-4 text-center text-sm"
          style={{ letterSpacing: 0.1 }}
        >
          Just a moment...
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
