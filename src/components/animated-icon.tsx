import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

// ~3s timeline: native 350 + hold 450 + wordIn 500 + markHold 40 + morph 600 + commHold 450 + fade 350 ≈ 2740ms (+ spring settle)
const NATIVE_HOLD = 350;
const HOLD_FULL = 450;
const WORD_IN = 500;
const MARK_HOLD = 40;
const MORPH = 600;
const COMM_HOLD = 450;
const FADE = 350;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const startTime = useRef<number | null>(null);

  const wordX = useSharedValue(0);
  const wordOpacity = useSharedValue(1);
  const markX = useSharedValue(0);
  const markRadius = useSharedValue(12);
  const markOpacity = useSharedValue(1);
  const markScale = useSharedValue(1);
  const commOpacity = useSharedValue(0);
  const commScale = useSharedValue(0.42);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    if (!animate) return;
    // word keeps native size, slides behind opaque "?" — fade early so protruding ends vanish before center
    const slideSpring = { damping: 18, stiffness: 160, mass: 0.9 };
    wordX.value = withDelay(HOLD_FULL, withSpring(-32, slideSpring));
    markX.value = withDelay(HOLD_FULL, withSpring(111, slideSpring));
    wordOpacity.value = withDelay(HOLD_FULL + 120, withTiming(0, { duration: 200, easing: Easing.linear }));
    // morph: "?" 54→128 (2.37x) while Communities 0.42→1, same spring, borderRadius softens
    const morphSpring = { damping: 16, stiffness: 120, mass: 0.95 };
    const morphStart = HOLD_FULL + WORD_IN + MARK_HOLD;
    markOpacity.value = withDelay(morphStart, withTiming(0, { duration: MORPH, easing: Easing.inOut(Easing.cubic) }));
    markScale.value = withDelay(morphStart, withSpring(2.37, morphSpring));
    markRadius.value = withDelay(morphStart, withSpring(22, morphSpring));
    commOpacity.value = withDelay(morphStart, withTiming(1, { duration: MORPH, easing: Easing.inOut(Easing.cubic) }));
    commScale.value = withDelay(morphStart, withSpring(1, morphSpring));
    // overlay fade
    const fadeStart = HOLD_FULL + WORD_IN + MARK_HOLD + MORPH + COMM_HOLD;
    overlayOpacity.value = withDelay(fadeStart, withTiming(0, { duration: FADE, easing: Easing.out(Easing.cubic) }));
    const t = setTimeout(() => setVisible(false), fadeStart + FADE + 80);
    return () => clearTimeout(t);
  }, [animate]);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateX: wordX.value }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    borderRadius: markRadius.value,
    transform: [{ translateX: markX.value }, { scale: markScale.value }],
  }));
  const commStyle = useAnimatedStyle(() => ({
    opacity: commOpacity.value,
    transform: [{ scale: commScale.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  const plainRow = (
    <View style={styles.centered}>
      <Image style={styles.splashImage} source={require('@/assets/images/QuestionPro.png')} />
    </View>
  );

  return animate ? (
    <Animated.View style={[styles.splashOverlay, overlayStyle]}>
      {/* Communities blooms from mark center */}
      <Animated.View style={[styles.centered, commStyle]}>
        <Image style={styles.communitiesImage} source={require('@/assets/images/CommunitiesLogo.png')} />
      </Animated.View>
      {/* Mark */}
      <Animated.View style={[styles.row, { position: 'absolute' }]}>
        <Animated.View style={[styles.markWrap, markStyle]}>
          <Image style={styles.questionMark} source={require('@/assets/images/QuestionMark.png')} />
        </Animated.View>
        <Animated.View style={wordStyle}>
          <Image style={styles.questionWord} source={require('@/assets/images/QuestionWord.png')} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        if (startTime.current == null) startTime.current = Date.now();
        setTimeout(() => {
          SplashScreen.hideAsync().finally(() => setAnimate(true));
        }, NATIVE_HOLD);
      }}
      style={styles.splashOverlay}>
      {plainRow}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  splashImage: {
    width: 280,
    height: 54,
    resizeMode: 'contain',
  },
  communitiesImage: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  centered: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  markWrap: {
    zIndex: 2,
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1B3380',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },
  questionWord: {
    width: 226,
    height: 54,
    resizeMode: 'contain',
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F8FBFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
