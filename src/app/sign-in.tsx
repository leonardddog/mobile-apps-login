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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/ctx';
import { useTheme } from '@/hooks/use-theme';

export default function SignInScreen() {
  const { signIn } = useSession();
  const theme = useTheme();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Sign in to your account to continue
              </ThemedText>
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
                  placeholderTextColor={theme.textSecondary}
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
                      color: '#000000',
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
                    placeholderTextColor={theme.textSecondary}
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
                        color: '#000000',
                        fontFamily: Fonts.regular,
                        backgroundColor: passwordFocused ? '#F5F5F5' : '#FFFFFF',
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    style={styles.showPress}>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      {showPassword ? 'Hide' : 'Show'}
                    </ThemedText>
                  </Pressable>
                </Pressable>
              </View>

              <Pressable onPress={() => {}} style={styles.forgotPress}>
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

              <Pressable
                onPress={onSubmit}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: '#0A84FF', opacity: submitting ? 0.7 : pressed ? 0.9 : 1 },
                ]}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>
                    Sign in
                  </ThemedText>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary">
                Don&apos;t have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => {}}>
                <ThemedText type="smallBold" style={{ color: '#3c87f7' }}>
                  Sign up
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignSelf: 'stretch',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  form: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
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
  },
  forgotText: {
    fontWeight: '600',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.three,
  },
});
