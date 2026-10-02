import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Mask,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
  Svg,
} from 'react-native-svg';

// Parked variants ('grid', 'wash') are kept below but never mounted —
// zero runtime cost (no views, no animations) until one is wired up.
export type LoginBgVariant = 'dots' | 'grid' | 'wash';

// Static, code-drawn backgrounds. Light-only palette.
export function LoginBackground({ variant }: { variant: LoginBgVariant }) {
  if (variant === 'dots') return <DotsBackground />;
  if (variant === 'grid') return <GridBackground />;
  return <WashBackground />;
}

// Idea A: full-bleed micro-dot matrix, staggered rows for a subtle diagonal
// rhythm, radial mask keeps the center empty with a soft edge vignette.
// The layer itself slowly drifts (±8px, UI thread only — the SVG is never
// re-rendered per frame). Overscanned 24px so edges stay covered.
function DotsBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(v ?? false));
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    dx.value = withRepeat(
      withTiming(16, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    dy.value = withRepeat(
      withTiming(-12, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(dx);
      cancelAnimation(dy);
    };
  }, [dx, dy, reduceMotion]);

  const drift = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }],
  }));

  return (
    <Animated.View style={[styles.drift, drift]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="bgDots" width={22} height={36} patternUnits="userSpaceOnUse">
            <Circle cx={5} cy={9} r={1.7} fill="#1B87E6" fillOpacity={0.16} />
            <Circle cx={16} cy={27} r={1.7} fill="#1B87E6" fillOpacity={0.16} />
          </Pattern>
          <RadialGradient id="bgDotsFade" cx="50%" cy="40%" r="75%">
            <Stop offset="0%" stopColor="#fff" stopOpacity={0} />
            <Stop offset="45%" stopColor="#fff" stopOpacity={0.55} />
            <Stop offset="75%" stopColor="#fff" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0.3} />
          </RadialGradient>
          <Mask id="bgDotsMask">
            <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgDotsFade)" />
          </Mask>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgDots)" mask="url(#bgDotsMask)" />
      </Svg>
    </Animated.View>
  );
}

// Idea B: square dot grid with a different rhythm and top-weighted fade.
function GridBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <Pattern id="bgGrid" width={26} height={26} patternUnits="userSpaceOnUse">
          <Circle cx={6} cy={6} r={1.6} fill="#0A84FF" fillOpacity={0.15} />
        </Pattern>
        <RadialGradient id="bgGridFade" cx="50%" cy="34%" r="70%">
          <Stop offset="0%" stopColor="#fff" stopOpacity={0} />
          <Stop offset="40%" stopColor="#fff" stopOpacity={0.6} />
          <Stop offset="70%" stopColor="#fff" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#fff" stopOpacity={0.4} />
        </RadialGradient>
        <Mask id="bgGridMask">
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgGridFade)" />
        </Mask>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgGrid)" mask="url(#bgGridMask)" />
    </Svg>
  );
}

// Idea C: top-anchored wash — dot patch + soft glow behind the header only,
// fading to transparent well before the form.
function WashBackground() {
  return (
    <Svg
      width="100%"
      height={320}
      style={styles.wash}
      pointerEvents="none">
      <Defs>
        <Pattern id="bgWashDots" width={20} height={20} patternUnits="userSpaceOnUse">
          <Circle cx={4} cy={4} r={1.6} fill="#1B3380" fillOpacity={0.08} />
        </Pattern>
        <LinearGradient id="bgWashFade" x1={0} y1={0} x2={0} y2={1}>
          <Stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </LinearGradient>
        <Mask id="bgWashMask">
          <Rect x={0} y={0} width="100%" height={230} fill="url(#bgWashFade)" />
        </Mask>
        <RadialGradient id="bgWashGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#1B3380" stopOpacity={0.18} />
          <Stop offset="100%" stopColor="#1B3380" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50%" cy={10} rx="80%" ry={300} fill="url(#bgWashGlow)" />
      <Rect x={0} y={0} width="100%" height={230} fill="url(#bgWashDots)" mask="url(#bgWashMask)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  // Overscanned so the ±8px drift never exposes an uncovered edge
  drift: {
    ...StyleSheet.absoluteFill,
    top: -24,
    left: -24,
    right: -24,
    bottom: -24,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
