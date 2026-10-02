import { BottomSheet, RNHostView } from '@expo/ui';
import { background, ignoreSafeArea } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginBackground } from '@/components/login-background';
import { LoginIllustration } from '@/components/login-illustration';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/ctx';

export default function LoginSheetsScreen() {
  const { signIn } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  // Set on successful submit; navigation happens in onLoginDismiss so the
  // screen never unmounts while the native sheet is mid-dismiss (hard crash).
  const loginDone = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSubmitLogin = async () => {
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
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    loginDone.current = true;
    setLoginOpen(false);
  };

  const onLoginDismiss = () => {
    setLoginOpen(false);
    if (loginDone.current) {
      loginDone.current = false;
      signIn();
      router.replace('/(app)');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LoginBackground variant="dots" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={[styles.title, { color: '#1B3380' }]}>
              Welcome to Communities
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Log in or create an account to continue
            </ThemedText>
          </View>

          <View style={styles.buttons}>
            <View style={styles.illustrationWrap}>
              <LoginIllustration width={200} />
            </View>
            <Pressable
              onPress={() => setLoginOpen(true)}
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.9 : 1 }]}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Log in
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setSignupOpen(true)}
              style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}>
              <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                Sign up
              </ThemedText>
            </Pressable>
          </View>
        </View>
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

      {/* ignoreSafeArea(.keyboard) on the content stops iOS from growing
          the sheet when the keyboard opens; no fixed detent needed.
          background() on the sheet root paints the whole sheet incl. chrome. */}
      <BottomSheet
        isPresented={loginOpen}
        onDismiss={onLoginDismiss}
        modifiers={[background('#FFFFFF')]}>
        <RNHostView
          style={{ backgroundColor: '#FFFFFF' }}
          modifiers={[ignoreSafeArea({ regions: 'keyboard' }), background('#FFFFFF')]}>
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheet}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}>
            <ThemedText type="smallBold" style={styles.sheetTitle}>
              Log in
            </ThemedText>

            <View style={styles.sheetForm}>
              <View style={styles.field}>
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
                      borderColor: emailFocused ? '#1B87E6' : '#9B9B9B',
                    },
                  ]}
                />
              </View>

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
                    onSubmitEditing={onSubmitLogin}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={[
                      styles.passwordInput,
                      {
                        backgroundColor: passwordFocused ? '#F5F5F5' : '#FFFFFF',
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    style={styles.showPress}>
                    <ThemedText type="small" style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </ThemedText>
                  </Pressable>
                </Pressable>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <ThemedText type="small" style={{ color: '#DC2626' }}>
                  {error}
                </ThemedText>
              </View>
            )}

            <Pressable
              onPress={onSubmitLogin}
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
          </ScrollView>
        </RNHostView>
      </BottomSheet>

      <BottomSheet
        isPresented={signupOpen}
        onDismiss={() => setSignupOpen(false)}
        modifiers={[background('#FFFFFF')]}>
        <RNHostView
          style={{ backgroundColor: '#FFFFFF' }}
          modifiers={[background('#FFFFFF')]}>
          <View style={styles.sheet}>
            <ThemedText type="smallBold" style={styles.sheetTitle}>
              Create account
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.placeholderText}>
              Sign up is coming soon.
            </ThemedText>
            <Pressable
              onPress={() => setSignupOpen(false)}
              style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}>
              <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                Close
              </ThemedText>
            </Pressable>
          </View>
        </RNHostView>
      </BottomSheet>
    </ThemedView>
  );
}

// Spacing reference (at a glance — same tokens as Classic; Spacing: one 4, two 8, three 16, four 24):
// Main screen (content): paddingH 24, paddingTop 24, paddingBottom 24, space-between
//   → header pinned top, illustration + buttons pinned bottom (bottom-pinning needs
//     space-between, not the container gap Classic uses)
// Login sheet: padding 16 all around; sections gap 24, fields gap 16
// Inputs: paddingH 16; password row paddingLeft 16 / paddingRight 8; height 49
// Button: paddingVertical 14 + marginTop 4; footer "Powered by" paddingVertical 16
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    justifyContent: 'space-between',
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
    alignSelf: 'stretch',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  buttons: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  illustrationWrap: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: '#1B87E6',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Same as Classic (marginTop 4 on top of the 16 stack gap)
    marginTop: Spacing.one,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  secondaryButton: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1B87E6',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1B87E6',
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
  sheet: {
    width: '100%',
    padding: Spacing.three,
    gap: Spacing.four,
    backgroundColor: '#FFFFFF',
  },
  sheetScroll: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  sheetForm: {
    gap: Spacing.three,
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1B3380',
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
    color: '#545E6B',
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
    color: '#545E6B',
    textAlignVertical: 'center',
  },
  showPress: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  placeholderText: {
    fontFamily: Fonts.regular,
  },
});
