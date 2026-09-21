import { BottomSheet, RNHostView } from '@expo/ui';
import { background, ignoreSafeArea } from '@expo/ui/swift-ui/modifiers';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';

import { LoginBackground } from '@/components/login-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/ctx';

export default function SignInScreen() {
  const { signIn } = useSession();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFocused, setForgotFocused] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotResending, setForgotResending] = useState(false);
  const [forgotFormHeight, setForgotFormHeight] = useState(300);
  const [forgotSentHeight, setForgotSentHeight] = useState(360);
  // Keeps the blur/scrim mounted while the native sheet plays its dismiss
  // animation; without it the overlay unmounts instantly and the full content
  // flashes through the still-fading sheet.
  const [forgotClosing, setForgotClosing] = useState(false);
  const forgotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;
  const canSendReset = forgotEmail.trim().length > 0;

  const openForgot = () => {
    if (forgotTimer.current) {
      clearTimeout(forgotTimer.current);
      forgotTimer.current = null;
    }
    setForgotClosing(false);
    setForgotEmail(email);
    setForgotError(null);
    setForgotSent(false);
    setForgotOpen(true);
  };

  const onForgotDismiss = () => {
    setForgotOpen(false);
    setForgotError(null);
    setForgotSent(false);
    setForgotSending(false);
    setForgotResending(false);
    setForgotClosing(true);
    if (forgotTimer.current) {
      clearTimeout(forgotTimer.current);
    }
    forgotTimer.current = setTimeout(() => {
      setForgotClosing(false);
      forgotTimer.current = null;
    }, 400);
  };

  const onSubmitForgot = async () => {
    setForgotError(null);
    const normalizedEmail = forgotEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotSending(true);
    // Simulate async send; replace with real API call:
    // const { error } = await requestPasswordReset(normalizedEmail)
    await new Promise((r) => setTimeout(r, 500));
    setForgotSending(false);
    setForgotSent(true);
  };

  const onResendForgot = async () => {
    setForgotResending(true);
    // Simulate async resend; replace with real API call:
    await new Promise((r) => setTimeout(r, 500));
    setForgotResending(false);
  };

  const onSubmit = async () => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    // Simulate async auth; replace with real API call:
    // const { error } = await signInWithEmail(normalizedEmail, password)
    await new Promise((r) => setTimeout(r, 500));
    signIn();
    setSubmitting(false);
    router.replace('/(app)');
  };

  return (
    <ThemedView style={styles.container}>
      <LoginBackground variant="dots" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? undefined : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText type="title" style={[styles.title, { color: '#1B3380' }]}>
                Welcome to Communities
              </ThemedText>
              <View style={styles.subtitleRow}>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  New here?{' '}
                </ThemedText>
                <Pressable onPress={() => { }}>
                  <ThemedText style={[styles.subtitle, styles.signupLink]}>Sign up</ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.form}>
              <Pressable onPress={() => emailRef.current?.focus()} style={styles.field}>
                <ThemedText type="smallBold" style={styles.label}>
                  Email
                </ThemedText>
                <TextInput
                  ref={emailRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9B9B9B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  style={[
                    styles.input,
                    {
                      backgroundColor: emailFocused ? '#F5F5F5' : '#FFFFFF',
                      color: '#545E6B',
                      borderColor: emailFocused ? '#1B87E6' : '#9B9B9B',
                      fontFamily: Fonts.regular,
                    },
                  ]}
                />
              </Pressable>

              <View style={styles.field}>
                <ThemedText type="smallBold" style={styles.label}>
                  Password
                </ThemedText>
                <Pressable
                  onPress={() => passwordRef.current?.focus()}
                  style={[
                    styles.passwordRow,
                    {
                      backgroundColor: passwordFocused ? '#F5F5F5' : '#FFFFFF',
                      borderColor: passwordFocused ? '#1B87E6' : '#9B9B9B',
                    },
                  ]}>
                  <TextInput
                    ref={passwordRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9B9B9B"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={[
                      styles.passwordInput,
                      {
                        color: '#545E6B',
                        fontFamily: Fonts.regular,
                        backgroundColor: passwordFocused ? '#F5F5F5' : '#FFFFFF',
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    style={styles.showPress}>
                    <ThemedText
                      type="small"
                      style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </ThemedText>
                  </Pressable>
                </Pressable>
              </View>

              <Pressable onPress={openForgot} style={styles.forgotPress}>
                <ThemedText type="small" style={[styles.forgotText, { color: '#3c87f7' }]}>
                  Forgot password?
                </ThemedText>
              </Pressable>

              {error && (
                <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <ThemedText type="small" style={{ color: '#DC2626' }}>
                    {error}
                  </ThemedText>
                </View>
              )}

            </View>

            <View style={styles.loginGroup}>
              <Pressable
                onPress={onSubmit}
                disabled={!canSubmit || submitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: canSubmit ? '#1B87E6' : '#F0F0F0',
                    opacity: submitting ? 0.7 : pressed ? 0.9 : 1,
                  },
                ]}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText
                    type="smallBold"
                    style={[styles.primaryButtonText, { color: canSubmit ? '#fff' : '#9B9B9B' }]}>
                    Log in
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <View style={styles.poweredBy}>
          <ThemedText type="small" style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
            Powered by{' '}
          </ThemedText>
          <Pressable onPress={() => { }}>
            <ThemedText type="small" style={styles.poweredByLink}>
              QuestionPro
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>

      {(forgotOpen || forgotClosing) && (
        <View style={styles.screenBlur} pointerEvents="none">
          <View style={[styles.screenScrim, StyleSheet.absoluteFill]} />
          <BlurView intensity={5} tint="light" style={StyleSheet.absoluteFill} />
        </View>
      )}

      <BottomSheet
        isPresented={forgotOpen}
        onDismiss={onForgotDismiss}
        snapPoints={[{ height: (forgotSent ? forgotSentHeight : forgotFormHeight) + 56 }]}
        contentPadding={{
          top: Spacing.five,
          bottom: Spacing.four,
          left: Spacing.four,
          right: Spacing.four,
        }}
        modifiers={[background('#FFFFFF')]}>
        <RNHostView modifiers={[ignoreSafeArea({ regions: 'keyboard' })]}>
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}>
            {forgotSent ? (
              <Animated.View
                key="forgot-sent"
                entering={SlideInRight.duration(240)}
                onLayout={(e) => setForgotSentHeight(Math.round(e.nativeEvent.layout.height))}
                style={styles.sheetStage}>
                <View style={styles.sheetHeader}>
                  <Animated.View
                    entering={ZoomIn.springify().damping(14).stiffness(150).delay(80)}
                    style={styles.checkCircle}>
                    <View style={styles.checkBarMain} />
                    <View style={styles.checkBarShort} />
                  </Animated.View>
                  <Animated.View entering={FadeInDown.delay(200).duration(240)} style={styles.sheetStage}>
                    <ThemedText type="smallBold" style={styles.sheetTitle}>
                      Check your inbox
                    </ThemedText>
                    <ThemedText type="small" style={styles.sheetBody}>
                      {"We've sent the instructions to reset your password to "}
                      <ThemedText type="smallBold" style={styles.sheetBody}>
                        {forgotEmail.trim().toLowerCase()}
                      </ThemedText>
                      .{" Follow the steps in the email to finish resetting it."}
                    </ThemedText>
                  </Animated.View>
                </View>

                <Animated.View entering={FadeIn.delay(340).duration(260)} style={styles.sheetStage}>
                  <View style={styles.sheetActions}>
                    <Pressable
                      onPress={onForgotDismiss}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        { backgroundColor: '#1B87E6', opacity: pressed ? 0.9 : 1, marginTop: 0 },
                      ]}>
                      <ThemedText type="smallBold" style={styles.primaryButtonText}>
                        Done
                      </ThemedText>
                    </Pressable>
                  </View>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(420).duration(260)} style={styles.sheetStage}>
                  <View style={styles.resendRow}>
                    <ThemedText type="small" style={styles.resendText}>
                      {"Didn't receive any mail? "}
                    </ThemedText>
                    <Pressable onPress={onResendForgot} disabled={forgotResending} hitSlop={8}>
                      <ThemedText type="small" style={styles.resendLink}>
                        {forgotResending ? 'Resending…' : 'Send again'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </Animated.View>
              </Animated.View>
            ) : (
              <Animated.View
                key="forgot-form"
                entering={SlideInLeft.duration(220)}
                onLayout={(e) => setForgotFormHeight(Math.round(e.nativeEvent.layout.height))}
                style={styles.sheetStage}>
                <View style={styles.sheetHeader}>
                  <ThemedText type="smallBold" style={styles.sheetTitle}>
                    Forgot password?
                  </ThemedText>
                  <ThemedText type="small" style={styles.sheetBody}>
                    {"Enter the email you use to sign in and we'll send you a reset link."}
                  </ThemedText>
                </View>

                <View style={styles.field}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Email
                  </ThemedText>
                  <TextInput
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#9B9B9B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="done"
                    onSubmitEditing={onSubmitForgot}
                    onFocus={() => setForgotFocused(true)}
                    onBlur={() => setForgotFocused(false)}
                    style={[
                      styles.input,
                      {
                        backgroundColor: forgotFocused ? '#F5F5F5' : '#FFFFFF',
                        color: '#545E6B',
                        borderColor: forgotFocused ? '#1B87E6' : '#9B9B9B',
                        fontFamily: Fonts.regular,
                      },
                    ]}
                  />
                </View>

                {forgotError && (
                  <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <ThemedText type="small" style={{ color: '#DC2626' }}>
                      {forgotError}
                    </ThemedText>
                  </View>
                )}

                <Pressable
                  onPress={onSubmitForgot}
                  disabled={!canSendReset || forgotSending}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: canSendReset ? '#1B87E6' : '#F0F0F0',
                      opacity: forgotSending ? 0.7 : pressed ? 0.9 : 1,
                      marginTop: 0,
                    },
                  ]}>
                  {forgotSending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText
                      type="smallBold"
                      style={[styles.primaryButtonText, { color: canSendReset ? '#fff' : '#9B9B9B' }]}>
                      Send reset link
                    </ThemedText>
                  )}
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </RNHostView>
      </BottomSheet>
    </ThemedView>
  );
}

// Spacing reference (at a glance — Spacing: half 2, one 4, two 8, three 16, four 24, five 32):
// Container (scrollContent): paddingH 24, paddingTop 24, paddingBottom 24, gap 32
//   → header ↔ form ↔ login button are each separated by 32
// Form: gap 16 between fields; password → forgot is pulled up to 8 (forgotPress marginTop -8)
// Inputs: email paddingH 16; password row paddingLeft 16 / paddingRight 8; height 49
// Button: paddingVertical 14 + marginTop 4; footer "Powered by" paddingVertical 16
// Forgot sheet: fixed detent (300 form / 260 success, iOS pts) — never re-measures for keyboard;
// native contentPadding top 32, sides/bottom 24; header ↔ actions gap 24, fields gap 16
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenBlur: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  screenScrim: {
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.five,
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  signupLink: {
    color: '#3c87f7',
  },
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9B9B9B',
    backgroundColor: '#FFFFFF',
    height: 49,
    paddingHorizontal: Spacing.three,
    paddingVertical: 0,
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlignVertical: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9B9B9B',
    backgroundColor: '#FFFFFF',
    height: 49,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlignVertical: 'center',
  },
  showPress: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  forgotPress: {
    alignSelf: 'flex-start',
    // Form gap is 16; pull up by 8 so password → forgot reads 8
    marginTop: -Spacing.two,
  },
  forgotText: {
    fontFamily: Fonts.regular,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  loginGroup: {
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  poweredBy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  poweredByLink: {
    color: '#3c87f7',
    fontFamily: Fonts.regular,
  },
  sheetContent: {
    width: '100%',
    gap: Spacing.four,
  },
  sheetStage: {
    width: '100%',
    gap: Spacing.four,
  },
  sheetScroll: {
    width: '100%',
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B3380',
  },
  checkBarMain: {
    position: 'absolute',
    left: 11,
    top: 23.5,
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '37deg' }],
  },
  checkBarShort: {
    position: 'absolute',
    left: 16.5,
    top: 19,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-49deg' }],
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  resendText: {
    color: '#545E6B',
    fontFamily: Fonts.regular,
  },
  resendLink: {
    color: '#3c87f7',
    fontFamily: Fonts.regular,
  },
  sheetHeader: {
    gap: Spacing.two,
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Fonts.semiBold,
    color: '#1B3380',
  },
  sheetBody: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  sheetActions: {
    gap: Spacing.three,
  },
});
