import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import Animated, { Easing, FadeIn, SlideInRight } from 'react-native-reanimated';

import { LoginBackground } from '@/components/login-background';
import { LoginIllustration } from '@/components/login-illustration';
import { AppleIcon, FacebookIcon, GoogleIcon, LinkedInIcon } from '@/components/sso-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/ctx';

// Unified approach — Screen 1: access code (Figma 105:1851),
// Screen 2: community welcome / credentials (Figma 119:2174).
// Dotted background kept per requirement; Figma shows plain white.
const COMMUNITY_NAMES: Record<string, string> = {
  A123Z: 'Petverse',
};

// Inlined from Figma check 110:3325 (16x16, #42BD84).
function CheckIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M6.36667 10.1L12.0167 4.45C12.15 4.31667 12.3056 4.25 12.4833 4.25C12.6611 4.25 12.8167 4.31667 12.95 4.45C13.0833 4.58333 13.15 4.74167 13.15 4.925C13.15 5.10833 13.0833 5.26667 12.95 5.4L6.83333 11.5333C6.7 11.6667 6.54444 11.7333 6.36667 11.7333C6.18889 11.7333 6.03333 11.6667 5.9 11.5333L3.03333 8.66667C2.9 8.53333 2.83611 8.375 2.84167 8.19167C2.84722 8.00833 2.91667 7.85 3.05 7.71667C3.18333 7.58333 3.34167 7.51667 3.525 7.51667C3.70833 7.51667 3.86667 7.58333 4 7.71667L6.36667 10.1Z"
        fill="#42BD84"
      />
    </Svg>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.reqRow}>
      {met ? (
        <CheckIcon />
      ) : (
        <ThemedText style={styles.reqBullet}>•</ThemedText>
      )}
      <ThemedText style={met ? styles.reqMet : styles.reqUnmet}>{text}</ThemedText>
    </View>
  );
}

function SignupStepper({ done }: { done: number }) {
  return (
    <View style={styles.stepperRow} accessibilityLabel={`Step ${done} of 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <View
          key={index}
          style={[styles.stepSeg, index < done ? styles.stepDone : styles.stepTodo]}
        />
      ))}
    </View>
  );
}

// Inlined from Figma close 129:3009 (24x24, #545E6B).
function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 13.4L7.1 18.3C6.91667 18.4833 6.68333 18.575 6.4 18.575C6.11667 18.575 5.88333 18.4833 5.7 18.3C5.51667 18.1167 5.425 17.8833 5.425 17.6C5.425 17.3167 5.51667 17.0833 5.7 16.9L10.6 12L5.7 7.1C5.51667 6.91667 5.425 6.68333 5.425 6.4C5.425 6.11667 5.51667 5.88333 5.7 5.7C5.88333 5.51667 6.11667 5.425 6.4 5.425C6.68333 5.425 6.91667 5.51667 7.1 5.7L12 10.6L16.9 5.7C17.0833 5.51667 17.3167 5.425 17.6 5.425C17.8833 5.425 18.1167 5.51667 18.3 5.7C18.4833 5.88333 18.575 6.11667 18.575 6.4C18.575 6.68333 18.4833 6.91667 18.3 7.1L13.4 12L18.3 16.9C18.4833 17.0833 18.575 17.3167 18.575 17.6C18.575 17.8833 18.4833 18.1167 18.3 18.3C18.1167 18.4833 17.8833 18.575 17.6 18.575C17.3167 18.575 17.0833 18.4833 16.9 18.3L12 13.4Z"
        fill="#545E6B"
      />
    </Svg>
  );
}

export default function LoginUnifiedScreen() {
  const { signIn } = useSession();
  const [step, setStep] = useState<
    | 'access-code'
    | 'credentials'
    | 'signup'
    | 'forgot'
    | 'forgot-verify'
    | 'reset-password'
    | 'signup-verify'
    | 'signup-password'
    | 'signup-profile'
  >('access-code');
  // Slide = forward/deeper (access code → community), fade = lateral (login ↔ signup).
  const [enterAnim, setEnterAnim] = useState<'slide' | 'fade'>('slide');
  const [validatedCode, setValidatedCode] = useState('');
  const communityName = COMMUNITY_NAMES[validatedCode] ?? 'Communities';

  const accessCodeRef = useRef<TextInput>(null);

  const [accessCode, setAccessCode] = useState('');
  const [accessFocused, setAccessFocused] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessSubmitting, setAccessSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const signupEmailRef = useRef<TextInput>(null);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupFocused, setSignupFocused] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  const signupCodeRefs = useRef<(TextInput | null)[]>([]);

  const [signupCodeDigits, setSignupCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [signupCodeError, setSignupCodeError] = useState<string | null>(null);
  const [signupCodeVerifying, setSignupCodeVerifying] = useState(false);
  const [signupResending, setSignupResending] = useState(false);
  const [signupResentNote, setSignupResentNote] = useState(false);

  const forgotInputRef = useRef<TextInput>(null);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFocused, setForgotFocused] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSending, setForgotSending] = useState(false);

  const codeRefs = useRef<(TextInput | null)[]>([]);

  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeVerifying, setCodeVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentNote, setResentNote] = useState(false);

  const canSubmitAccess = accessCode.trim().length > 0;
  const canSubmitLogin = email.trim().length > 0 && password.length > 0;
  const canSubmitSignup = signupEmail.trim().length > 0;
  const canSendReset = forgotEmail.trim().length > 0;

  const onSubmitAccess = async () => {
    setAccessError(null);
    const code = accessCode.trim();

    if (!code) {
      setAccessError('Access code is required.');
      return;
    }

    if (code !== 'A123Z') {
      setAccessError('Invalid access code. Try again');
      return;
    }

    setAccessSubmitting(true);
    // Simulate async validation; replace with real API call:
    // const { error } = await validateAccessCode(code)
    await new Promise((r) => setTimeout(r, 300));
    setAccessSubmitting(false);
    // Release focus + close the keyboard before the slide, otherwise the
    // still-open keyboard carries focus into the email field on mount.
    accessCodeRef.current?.blur();
    Keyboard.dismiss();
    setValidatedCode(code);
    setEnterAnim('slide');
    setStep('credentials');
  };

  const onSubmitLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setPasswordError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setLoginSubmitting(true);
    // Simulate async auth; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    signIn();
    setLoginSubmitting(false);
    router.replace('/(app)');
  };

  const goSignup = () => {
    emailRef.current?.blur();
    passwordRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('signup');
  };

  const goSignin = () => {
    signupEmailRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('credentials');
  };

  const goForgot = () => {
    emailRef.current?.blur();
    passwordRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('forgot');
  };

  const goBackToSignin = () => {
    forgotInputRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('credentials');
  };

  const onSubmitForgot = async () => {
    setForgotError(null);
    const value = forgotEmail.trim();

    if (!value) {
      setForgotError('Please enter your email or username.');
      return;
    }

    setForgotSending(true);
    // Simulate async send; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setForgotSending(false);
    // Verification-code screen lands here (Figma 133:2389).
    forgotInputRef.current?.blur();
    Keyboard.dismiss();
    setCodeDigits(['', '', '', '', '', '']);
    setCodeError(null);
    setResentNote(false);
    setEnterAnim('fade');
    setStep('forgot-verify');
  };

  const goBackToForgot = () => {
    codeRefs.current.forEach((ref) => ref?.blur());
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('forgot');
  };

  const setCodeAt = (index: number, char: string) => {
    setCodeDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (codeError) setCodeError(null);
  };

  const onChangeCodeAt = (index: number, text: string) => {
    // Distribute pasted/multi-char input across boxes from the edited index.
    const chars = text.replace(/\D/g, '').slice(0, 6 - index).split('');
    if (chars.length === 0) {
      setCodeAt(index, '');
      return;
    }
    setCodeDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      return next;
    });
    if (codeError) setCodeError(null);
    const lastIndex = Math.min(index + chars.length, 5);
    if (chars.length > 1 || index < 5) {
      codeRefs.current[lastIndex]?.focus();
    }
  };

  const onCodeKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const onSubmitCode = async () => {
    setCodeError(null);
    const code = codeDigits.join('');

    if (code.length < 6) {
      setCodeError('Please enter the 6-digit code.');
      return;
    }
    if (code !== '123456') {
      setCodeError('Invalid code. Try again');
      return;
    }

    setCodeVerifying(true);
    // Simulate async verify; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setCodeVerifying(false);
    codeRefs.current.forEach((ref) => ref?.blur());
    Keyboard.dismiss();
    setNewPassword('');
    setResetError(null);
    setEnterAnim('fade');
    setStep('reset-password');
  };

  const onResendCode = async () => {
    setResending(true);
    // Simulate async resend; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setResending(false);
    setResentNote(true);
  };

  const newPasswordRef = useRef<TextInput>(null);

  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetDoneNote, setResetDoneNote] = useState(false);

  const passwordRules = {
    length: newPassword.length >= 8,
    cases: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?&#]/.test(newPassword),
  };
  const canSubmitReset =
    passwordRules.length && passwordRules.cases && passwordRules.number && passwordRules.special;

  const goBackToVerify = () => {
    newPasswordRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('forgot-verify');
  };

  const onSubmitReset = async () => {
    setResetError(null);
    if (!canSubmitReset) {
      setResetError('Please meet all password requirements.');
      return;
    }

    setResetSubmitting(true);
    // Simulate async reset; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setResetSubmitting(false);
    newPasswordRef.current?.blur();
    Keyboard.dismiss();
    setResetDoneNote(true);
    setEnterAnim('fade');
    setStep('credentials');
  };

  const onSubmitSignup = async () => {
    setSignupError(null);
    const normalizedEmail = signupEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setSignupError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setSignupError('Please enter a valid email address.');
      return;
    }

    setSignupSubmitting(true);
    // Simulate async signup; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setSignupSubmitting(false);
    // Email-verification screen lands here (Figma 128:2315).
    signupEmailRef.current?.blur();
    Keyboard.dismiss();
    setSignupCodeDigits(['', '', '', '', '', '']);
    setSignupCodeError(null);
    setSignupResentNote(false);
    setEnterAnim('fade');
    setStep('signup-verify');
  };

  const goCloseSignup = () => {
    signupCodeRefs.current.forEach((ref) => ref?.blur());
    signupPasswordRef.current?.blur();
    firstNameRef.current?.blur();
    lastNameRef.current?.blur();
    usernameRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('credentials');
  };

  const goBackToSignupVerify = () => {
    signupPasswordRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('signup-verify');
  };

  const signupPasswordRef = useRef<TextInput>(null);

  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPasswordFocused, setSignupPasswordFocused] = useState(false);
  const [signupPasswordError, setSignupPasswordError] = useState<string | null>(null);
  const [signupPasswordSubmitting, setSignupPasswordSubmitting] = useState(false);

  const signupPasswordRules = {
    length: signupPassword.length >= 8,
    cases: /[a-z]/.test(signupPassword) && /[A-Z]/.test(signupPassword),
    number: /\d/.test(signupPassword),
    special: /[@$!%*?&#]/.test(signupPassword),
  };
  const canSubmitSignupPassword =
    signupPasswordRules.length &&
    signupPasswordRules.cases &&
    signupPasswordRules.number &&
    signupPasswordRules.special;

  const onSubmitSignupPassword = async () => {
    setSignupPasswordError(null);
    if (!canSubmitSignupPassword) {
      setSignupPasswordError('Please meet all password requirements.');
      return;
    }

    setSignupPasswordSubmitting(true);
    // Simulate async set-password; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setSignupPasswordSubmitting(false);
    signupPasswordRef.current?.blur();
    Keyboard.dismiss();
    setFirstName('');
    setLastName('');
    setUsername('');
    setFirstNameError(null);
    setLastNameError(null);
    setUsernameError(null);
    setEnterAnim('fade');
    setStep('signup-profile');
  };

  const goBackToSignupPassword = () => {
    firstNameRef.current?.blur();
    lastNameRef.current?.blur();
    usernameRef.current?.blur();
    Keyboard.dismiss();
    setEnterAnim('fade');
    setStep('signup-password');
  };

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const canSubmitProfile =
    firstName.trim().length > 0 && lastName.trim().length > 0 && username.trim().length > 0;

  const onSubmitProfile = async () => {
    setFirstNameError(null);
    setLastNameError(null);
    setUsernameError(null);
    const first = firstName.trim();
    const last = lastName.trim();
    const handle = username.trim();

    let valid = true;
    if (!first) {
      setFirstNameError('First name is required.');
      valid = false;
    }
    if (!last) {
      setLastNameError('Last name is required.');
      valid = false;
    }
    if (!handle) {
      setUsernameError('Username is required.');
      valid = false;
    } else if (handle.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      valid = false;
    }
    if (!valid) return;

    setProfileSubmitting(true);
    // Simulate async profile save; replace with real API call.
    // Signup step 4 lands with its Figma design.
    await new Promise((r) => setTimeout(r, 500));
    setProfileSubmitting(false);
  };

  const onChangeSignupCodeAt = (index: number, text: string) => {
    // Distribute pasted/multi-char input across boxes from the edited index.
    const chars = text.replace(/\D/g, '').slice(0, 6 - index).split('');
    if (chars.length === 0) {
      setSignupCodeDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      if (signupCodeError) setSignupCodeError(null);
      return;
    }
    setSignupCodeDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      return next;
    });
    if (signupCodeError) setSignupCodeError(null);
    const lastIndex = Math.min(index + chars.length, 5);
    if (chars.length > 1 || index < 5) {
      signupCodeRefs.current[lastIndex]?.focus();
    }
  };

  const onSignupCodeKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !signupCodeDigits[index] && index > 0) {
      signupCodeRefs.current[index - 1]?.focus();
    }
  };

  const onSubmitSignupCode = async () => {
    setSignupCodeError(null);
    const code = signupCodeDigits.join('');

    if (code.length < 6) {
      setSignupCodeError('Please enter the 6-digit code.');
      return;
    }
    if (code !== '123456') {
      setSignupCodeError('Invalid code. Try again');
      return;
    }

    setSignupCodeVerifying(true);
    // Simulate async verify; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setSignupCodeVerifying(false);
    signupCodeRefs.current.forEach((ref) => ref?.blur());
    Keyboard.dismiss();
    setSignupPassword('');
    setSignupPasswordError(null);
    setEnterAnim('fade');
    setStep('signup-password');
  };

  const onResendSignupCode = async () => {
    setSignupResending(true);
    // Simulate async resend; replace with real API call.
    await new Promise((r) => setTimeout(r, 500));
    setSignupResending(false);
    setSignupResentNote(true);
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
            <Animated.View
              key={step}
              entering={
                enterAnim === 'slide'
                  ? SlideInRight.duration(350).easing(Easing.out(Easing.cubic))
                  : FadeIn.duration(280).easing(Easing.out(Easing.cubic))
              }
              style={styles.main}>
              {step === 'access-code' ? (
                <>
                <View style={styles.header}>
                  <ThemedText style={styles.title}>Welcome to Communities</ThemedText>
                  <ThemedText style={styles.subtitle}>
                    Enter your community&rsquo;s access code
                  </ThemedText>
                </View>

                <View style={styles.form}>
                  <Pressable onPress={() => accessCodeRef.current?.focus()} style={styles.field}>
                    <ThemedText type="smallBold" style={styles.label}>
                      Access code
                    </ThemedText>
                    <TextInput
                      ref={accessCodeRef}
                      value={accessCode}
                      onChangeText={(v) => {
                        setAccessCode(v);
                        if (accessError) setAccessError(null);
                      }}
                      placeholder="Enter access code"
                      placeholderTextColor="#9B9B9B"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={onSubmitAccess}
                      onFocus={() => setAccessFocused(true)}
                      onBlur={() => setAccessFocused(false)}
                      style={[
                        styles.input,
                        {
                          backgroundColor: accessError ? '#F5F5F5' : accessFocused ? '#F5F5F5' : '#FFFFFF',
                          borderColor: accessError ? '#A50000' : accessFocused ? '#1B87E6' : '#9B9B9B',
                        },
                      ]}
                    />
                    {accessError && (
                      <ThemedText style={styles.inlineError}>{accessError}</ThemedText>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={onSubmitAccess}
                    disabled={!canSubmitAccess || accessSubmitting}
                    accessibilityLabel="Continue"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSubmitAccess ? '#1B87E6' : '#F0F0F0',
                        opacity: accessSubmitting ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {accessSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSubmitAccess ? '#fff' : '#9B9B9B' },
                        ]}>
                        Continue
                      </ThemedText>
                    )}
                  </Pressable>
                </View>

                <View style={styles.illustrationWrap}>
                  <LoginIllustration width={207} />
                </View>
                </>
              ) : step === 'credentials' ? (
                <>
                <View style={styles.header}>
                  <ThemedText style={styles.title}>{communityName}</ThemedText>
                  <View style={styles.signupRow}>
                    <ThemedText style={styles.subtitle}>New to the community? </ThemedText>
                    <Pressable onPress={goSignup} accessibilityLabel="Create account">
                      <ThemedText style={[styles.subtitle, styles.linkText]}>
                        Create account
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.credentialsBody}>
                  <View style={styles.credentialsFields}>
                    <Pressable onPress={() => emailRef.current?.focus()} style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        Email
                      </ThemedText>
                      <TextInput
                        ref={emailRef}
                        value={email}
                        onChangeText={(v) => {
                          setEmail(v);
                          if (emailError) setEmailError(null);
                          if (resetDoneNote) setResetDoneNote(false);
                        }}
                        placeholder="Enter your email"
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
                            backgroundColor: emailError ? '#F5F5F5' : emailFocused ? '#F5F5F5' : '#FFFFFF',
                            borderColor: emailError ? '#A50000' : emailFocused ? '#1B87E6' : '#9B9B9B',
                          },
                        ]}
                      />
                      {emailError && (
                        <ThemedText style={styles.inlineError}>{emailError}</ThemedText>
                      )}
                    </Pressable>

                    <View style={styles.passwordBlock}>
                      <View style={styles.field}>
                        <ThemedText type="smallBold" style={styles.label}>
                          Password
                        </ThemedText>
                        <Pressable
                          onPress={() => passwordRef.current?.focus()}
                          style={[
                            styles.passwordRow,
                            {
                              backgroundColor:
                                passwordError ? '#F5F5F5' : passwordFocused ? '#F5F5F5' : '#FFFFFF',
                              borderColor:
                                passwordError ? '#A50000' : passwordFocused ? '#1B87E6' : '#9B9B9B',
                            },
                          ]}>
                          <TextInput
                            ref={passwordRef}
                            value={password}
                            onChangeText={(v) => {
                              setPassword(v);
                              if (passwordError) setPasswordError(null);
                              if (resetDoneNote) setResetDoneNote(false);
                            }}
                            placeholder="Enter your password"
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
                                backgroundColor:
                                  passwordError ? '#F5F5F5' : passwordFocused ? '#F5F5F5' : '#FFFFFF',
                              },
                            ]}
                          />
                          {/* WickUI visibility-off/on icons swap in here once
                              selected in Figma; text fallback keeps it usable. */}
                          <Pressable
                            onPress={() => setShowPassword((v) => !v)}
                            hitSlop={8}
                            style={styles.showPress}
                            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                            <ThemedText
                              type="small"
                              style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
                              {showPassword ? 'Hide' : 'Show'}
                            </ThemedText>
                          </Pressable>
                        </Pressable>
                        {passwordError && (
                          <ThemedText style={styles.inlineError}>{passwordError}</ThemedText>
                        )}
                      </View>
                      <Pressable onPress={goForgot} accessibilityLabel="Forgot password?">
                        <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    onPress={onSubmitLogin}
                    disabled={!canSubmitLogin || loginSubmitting}
                    accessibilityLabel="Log in"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSubmitLogin ? '#1B87E6' : '#F0F0F0',
                        opacity: loginSubmitting ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {loginSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSubmitLogin ? '#fff' : '#9B9B9B' },
                        ]}>
                        Log in
                      </ThemedText>
                    )}
                  </Pressable>

                  {resetDoneNote && (
                    <ThemedText style={styles.resetNote}>
                      Password updated. Sign in with your new password.
                    </ThemedText>
                  )}

                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <ThemedText style={styles.dividerText}>or continue with:</ThemedText>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.ssoRow}>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with Google"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <GoogleIcon size={20} />
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with Apple"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <AppleIcon size={22} />
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with Facebook"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <FacebookIcon size={20} />
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with LinkedIn"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <LinkedInIcon size={20} />
                    </Pressable>
                  </View>
                </View>
                </>
              ) : step === 'signup' ? (
                <>
                <View style={styles.header}>
                  <ThemedText style={styles.title}>{communityName}</ThemedText>
                  <View style={styles.signupRow}>
                    <ThemedText style={styles.subtitle}>Already a member? </ThemedText>
                    <Pressable onPress={goSignin} accessibilityLabel="Sign in">
                      <ThemedText style={[styles.subtitle, styles.linkText]}>
                        Sign in
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.credentialsBody}>
                  <View style={styles.credentialsFields}>
                    <Pressable onPress={() => signupEmailRef.current?.focus()} style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        Email
                      </ThemedText>
                      <TextInput
                        ref={signupEmailRef}
                        value={signupEmail}
                        onChangeText={(v) => {
                          setSignupEmail(v);
                          if (signupError) setSignupError(null);
                        }}
                        placeholder="Enter your email"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="done"
                        onSubmitEditing={onSubmitSignup}
                        onFocus={() => setSignupFocused(true)}
                        onBlur={() => setSignupFocused(false)}
                        style={[
                          styles.input,
                          {
                            backgroundColor: signupError ? '#F5F5F5' : signupFocused ? '#F5F5F5' : '#FFFFFF',
                            borderColor: signupError ? '#A50000' : signupFocused ? '#1B87E6' : '#9B9B9B',
                          },
                        ]}
                      />
                      {signupError && (
                        <ThemedText style={styles.inlineError}>{signupError}</ThemedText>
                      )}
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={onSubmitSignup}
                    disabled={!canSubmitSignup || signupSubmitting}
                    accessibilityLabel="Sign up with email"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSubmitSignup ? '#1B87E6' : '#F0F0F0',
                        opacity: signupSubmitting ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {signupSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSubmitSignup ? '#fff' : '#9B9B9B' },
                        ]}>
                        Sign up with email
                      </ThemedText>
                    )}
                  </Pressable>

                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <ThemedText style={styles.dividerText}>or sign up with:</ThemedText>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.ssoRow}>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with Google"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <GoogleIcon size={20} />
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with Apple"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <AppleIcon size={22} />
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with Facebook"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <FacebookIcon size={20} />
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      accessibilityLabel="Continue with LinkedIn"
                      style={({ pressed }) => [styles.ssoButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <LinkedInIcon size={20} />
                    </Pressable>
                  </View>
                </View>
                </>
              ) : step === 'forgot' ? (
                <>
                <View style={styles.forgotHeader}>
                  <View style={styles.topBarRow}>
                    <Pressable
                      onPress={goBackToSignin}
                      accessibilityLabel="Back to sign in"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <ThemedText style={styles.backChevron}>‹</ThemedText>
                    </Pressable>
                    <View style={styles.iconButtonSpacer} />
                  </View>
                  <View style={styles.header}>
                    <ThemedText style={styles.title}>Forgot password?</ThemedText>
                    <ThemedText style={styles.subtitle}>
                      Enter your email or username and we&rsquo;ll send you a reset link for your
                      password
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.credentialsBody}>
                  <Pressable onPress={() => forgotInputRef.current?.focus()} style={styles.field}>
                    <ThemedText type="smallBold" style={styles.label}>
                      Email or username
                    </ThemedText>
                    <TextInput
                      ref={forgotInputRef}
                      value={forgotEmail}
                      onChangeText={(v) => {
                        setForgotEmail(v);
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="Enter your email or username"
                      placeholderTextColor="#9B9B9B"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="username"
                      returnKeyType="done"
                      onSubmitEditing={onSubmitForgot}
                      onFocus={() => setForgotFocused(true)}
                      onBlur={() => setForgotFocused(false)}
                      style={[
                        styles.input,
                        {
                          backgroundColor: forgotError ? '#F5F5F5' : forgotFocused ? '#F5F5F5' : '#FFFFFF',
                          borderColor: forgotError ? '#A50000' : forgotFocused ? '#1B87E6' : '#9B9B9B',
                        },
                      ]}
                    />
                    {forgotError && (
                      <ThemedText style={styles.inlineError}>{forgotError}</ThemedText>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={onSubmitForgot}
                    disabled={!canSendReset || forgotSending}
                    accessibilityLabel="Send reset link"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSendReset ? '#1B87E6' : '#F0F0F0',
                        opacity: forgotSending ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {forgotSending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSendReset ? '#fff' : '#9B9B9B' },
                        ]}>
                        Send reset link
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
                </>
              ) : step === 'forgot-verify' ? (
                <>
                <View style={styles.forgotHeader}>
                  <View style={styles.topBarRow}>
                    <Pressable
                      onPress={goBackToForgot}
                      accessibilityLabel="Back to forgot password"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <ThemedText style={styles.backChevron}>‹</ThemedText>
                    </Pressable>
                    <View style={styles.iconButtonSpacer} />
                  </View>
                  <View style={styles.header}>
                    <ThemedText style={styles.title}>Forgot password?</ThemedText>
                    <ThemedText style={styles.subtitle}>
                      Enter the verification code we sent to:
                    </ThemedText>
                    <ThemedText style={styles.recipientText}>
                      {forgotEmail.trim() || 'your email'}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.verifyBody}>
                  <View style={styles.codeRow}>
                    {codeDigits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          codeRefs.current[index] = ref;
                        }}
                        value={digit}
                        onChangeText={(text) => onChangeCodeAt(index, text)}
                        onKeyPress={({ nativeEvent }) => onCodeKeyPress(index, nativeEvent.key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        returnKeyType={index === 5 ? 'done' : 'next'}
                        onSubmitEditing={() => {
                          if (index === 5) onSubmitCode();
                          else codeRefs.current[index + 1]?.focus();
                        }}
                        selectTextOnFocus
                        style={[
                          styles.codeBox,
                          {
                            backgroundColor: codeError ? '#F5F5F5' : '#FFFFFF',
                            borderColor: codeError ? '#A50000' : '#00000033',
                          },
                        ]}
                        accessibilityLabel={`Digit ${index + 1} of 6`}
                      />
                    ))}
                  </View>
                  {codeError && (
                    <ThemedText style={styles.inlineErrorCenter}>{codeError}</ThemedText>
                  )}

                  <Pressable
                    onPress={onSubmitCode}
                    disabled={codeDigits.join('').length < 6 || codeVerifying}
                    accessibilityLabel="Verify"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor:
                          codeDigits.join('').length === 6 ? '#1B87E6' : '#F0F0F0',
                        opacity: codeVerifying ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {codeVerifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: codeDigits.join('').length === 6 ? '#fff' : '#9B9B9B' },
                        ]}>
                        Verify
                      </ThemedText>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={onResendCode}
                    disabled={resending}
                    accessibilityLabel="Send a new code"
                    style={styles.resendPress}>
                    <ThemedText style={styles.resendLink}>
                      {resending ? 'Sending…' : 'Send a new code'}
                    </ThemedText>
                  </Pressable>
                  {resentNote && (
                    <ThemedText style={styles.comingSoonText}>Code sent.</ThemedText>
                  )}
                </View>
                </>
              ) : step === 'reset-password' ? (
                <>
                <View style={styles.forgotHeader}>
                  <View style={styles.topBarRow}>
                    <Pressable
                      onPress={goBackToVerify}
                      accessibilityLabel="Back to verification code"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <ThemedText style={styles.backChevron}>‹</ThemedText>
                    </Pressable>
                    <View style={styles.iconButtonSpacer} />
                  </View>
                  <View style={styles.header}>
                    <ThemedText style={styles.title}>Reset password</ThemedText>
                  </View>
                </View>

                <View style={styles.credentialsBody}>
                  <View style={styles.resetFields}>
                    <View style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        Password
                      </ThemedText>
                      <Pressable
                        onPress={() => newPasswordRef.current?.focus()}
                        style={[
                          styles.passwordRow,
                          {
                            backgroundColor:
                              resetError ? '#F5F5F5' : newPasswordFocused ? '#F5F5F5' : '#FFFFFF',
                            borderColor:
                              resetError ? '#A50000' : newPasswordFocused ? '#1B87E6' : '#9B9B9B',
                          },
                        ]}>
                        <TextInput
                          ref={newPasswordRef}
                          value={newPassword}
                          onChangeText={(v) => {
                            setNewPassword(v);
                            if (resetError) setResetError(null);
                          }}
                          placeholder="Enter your password"
                          placeholderTextColor="#9B9B9B"
                          secureTextEntry={!showNewPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="newPassword"
                          returnKeyType="done"
                          onSubmitEditing={onSubmitReset}
                          onFocus={() => setNewPasswordFocused(true)}
                          onBlur={() => setNewPasswordFocused(false)}
                          style={[
                            styles.passwordInput,
                            {
                              backgroundColor:
                                resetError ? '#F5F5F5' : newPasswordFocused ? '#F5F5F5' : '#FFFFFF',
                            },
                          ]}
                        />
                        {/* Text fallback like login; swaps to WickUI icons together. */}
                        <Pressable
                          onPress={() => setShowNewPassword((v) => !v)}
                          hitSlop={8}
                          style={styles.showPress}
                          accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}>
                          <ThemedText
                            type="small"
                            style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
                            {showNewPassword ? 'Hide' : 'Show'}
                          </ThemedText>
                        </Pressable>
                      </Pressable>
                      {resetError && (
                        <ThemedText style={styles.inlineError}>{resetError}</ThemedText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <ThemedText type="smallBold" style={styles.reqLabel}>
                        Requirements:
                      </ThemedText>
                      <View style={styles.reqList}>
                        <PasswordRequirement
                          met={passwordRules.length}
                          text="8 characters minimum"
                        />
                        <PasswordRequirement
                          met={passwordRules.cases}
                          text="Uppercase and lower case characters."
                        />
                        <PasswordRequirement met={passwordRules.number} text="A number." />
                        <PasswordRequirement
                          met={passwordRules.special}
                          text="A special character (e.g. @$!%*?)."
                        />
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={onSubmitReset}
                    disabled={!canSubmitReset || resetSubmitting}
                    accessibilityLabel="Reset"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSubmitReset ? '#1B87E6' : '#F0F0F0',
                        opacity: resetSubmitting ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {resetSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSubmitReset ? '#fff' : '#9B9B9B' },
                        ]}>
                        Reset
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
                </>
              ) : step === 'signup-verify' ? (
                <>
                <View style={styles.forgotHeader}>
                  <View style={styles.topBarRow}>
                    <View style={styles.iconButtonSpacer} />
                    <Pressable
                      onPress={goCloseSignup}
                      accessibilityLabel="Close sign up"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <CloseIcon />
                    </Pressable>
                  </View>
                  <View style={styles.signupVerifyHeader}>
                    <SignupStepper done={1} />
                    <View style={styles.header}>
                      <ThemedText style={styles.title}>Verify your email</ThemedText>
                      <ThemedText style={styles.subtitle}>
                        Enter the verification code we sent to:
                      </ThemedText>
                      <ThemedText style={styles.recipientText}>
                        {signupEmail.trim().toLowerCase() || 'your email'}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.verifyBody}>
                  <View style={styles.codeRow}>
                    {signupCodeDigits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          signupCodeRefs.current[index] = ref;
                        }}
                        value={digit}
                        onChangeText={(text) => onChangeSignupCodeAt(index, text)}
                        onKeyPress={({ nativeEvent }) => onSignupCodeKeyPress(index, nativeEvent.key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        returnKeyType={index === 5 ? 'done' : 'next'}
                        onSubmitEditing={() => {
                          if (index === 5) onSubmitSignupCode();
                          else signupCodeRefs.current[index + 1]?.focus();
                        }}
                        selectTextOnFocus
                        style={[
                          styles.codeBox,
                          {
                            backgroundColor: signupCodeError ? '#F5F5F5' : '#FFFFFF',
                            borderColor: signupCodeError ? '#A50000' : '#00000033',
                          },
                        ]}
                        accessibilityLabel={`Digit ${index + 1} of 6`}
                      />
                    ))}
                  </View>
                  {signupCodeError && (
                    <ThemedText style={styles.inlineErrorCenter}>{signupCodeError}</ThemedText>
                  )}

                  <Pressable
                    onPress={onSubmitSignupCode}
                    disabled={signupCodeDigits.join('').length < 6 || signupCodeVerifying}
                    accessibilityLabel="Verify"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor:
                          signupCodeDigits.join('').length === 6 ? '#1B87E6' : '#F0F0F0',
                        opacity: signupCodeVerifying ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {signupCodeVerifying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: signupCodeDigits.join('').length === 6 ? '#fff' : '#9B9B9B' },
                        ]}>
                        Verify
                      </ThemedText>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={onResendSignupCode}
                    disabled={signupResending}
                    accessibilityLabel="Send a new code"
                    style={styles.resendPress}>
                    <ThemedText style={styles.resendLink}>
                      {signupResending ? 'Sending…' : 'Send a new code'}
                    </ThemedText>
                  </Pressable>
                  {signupResentNote && (
                    <ThemedText style={styles.comingSoonText}>Code sent.</ThemedText>
                  )}
                </View>
                </>
              ) : step === 'signup-password' ? (
                <>
                <View style={styles.forgotHeader}>
                  <View style={styles.topBarRow}>
                    <Pressable
                      onPress={goBackToSignupVerify}
                      accessibilityLabel="Back to verify email"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <ThemedText style={styles.backChevron}>‹</ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={goCloseSignup}
                      accessibilityLabel="Close sign up"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <CloseIcon />
                    </Pressable>
                  </View>
                  <View style={styles.signupVerifyHeader}>
                    <SignupStepper done={2} />
                    <View style={styles.header}>
                      <ThemedText style={styles.title}>Set your password</ThemedText>
                      <ThemedText style={styles.subtitle}>
                        Choose a password for your next visit
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.credentialsBody}>
                  <View style={styles.resetFields}>
                    <View style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        Password
                      </ThemedText>
                      <Pressable
                        onPress={() => signupPasswordRef.current?.focus()}
                        style={[
                          styles.passwordRow,
                          {
                            backgroundColor:
                              signupPasswordError
                                ? '#F5F5F5'
                                : signupPasswordFocused
                                  ? '#F5F5F5'
                                  : '#FFFFFF',
                            borderColor:
                              signupPasswordError
                                ? '#A50000'
                                : signupPasswordFocused
                                  ? '#1B87E6'
                                  : '#9B9B9B',
                          },
                        ]}>
                        <TextInput
                          ref={signupPasswordRef}
                          value={signupPassword}
                          onChangeText={(v) => {
                            setSignupPassword(v);
                            if (signupPasswordError) setSignupPasswordError(null);
                          }}
                          placeholder="Enter your password"
                          placeholderTextColor="#9B9B9B"
                          secureTextEntry={!showSignupPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="newPassword"
                          returnKeyType="done"
                          onSubmitEditing={onSubmitSignupPassword}
                          onFocus={() => setSignupPasswordFocused(true)}
                          onBlur={() => setSignupPasswordFocused(false)}
                          style={[
                            styles.passwordInput,
                            {
                              backgroundColor:
                                signupPasswordError
                                  ? '#F5F5F5'
                                  : signupPasswordFocused
                                    ? '#F5F5F5'
                                    : '#FFFFFF',
                            },
                          ]}
                        />
                        {/* Text fallback like login/reset; swaps to WickUI icons together. */}
                        <Pressable
                          onPress={() => setShowSignupPassword((v) => !v)}
                          hitSlop={8}
                          style={styles.showPress}
                          accessibilityLabel={showSignupPassword ? 'Hide password' : 'Show password'}>
                          <ThemedText
                            type="small"
                            style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
                            {showSignupPassword ? 'Hide' : 'Show'}
                          </ThemedText>
                        </Pressable>
                      </Pressable>
                      {signupPasswordError && (
                        <ThemedText style={styles.inlineError}>{signupPasswordError}</ThemedText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <ThemedText type="smallBold" style={styles.reqLabel}>
                        Requirements:
                      </ThemedText>
                      <View style={styles.reqList}>
                        <PasswordRequirement
                          met={signupPasswordRules.length}
                          text="8 characters minimum"
                        />
                        <PasswordRequirement
                          met={signupPasswordRules.cases}
                          text="Uppercase and lower case characters."
                        />
                        <PasswordRequirement
                          met={signupPasswordRules.number}
                          text="A number."
                        />
                        <PasswordRequirement
                          met={signupPasswordRules.special}
                          text="A special character (e.g. @$!%*?)."
                        />
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={onSubmitSignupPassword}
                    disabled={!canSubmitSignupPassword || signupPasswordSubmitting}
                    accessibilityLabel="Continue"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSubmitSignupPassword ? '#1B87E6' : '#F0F0F0',
                        opacity: signupPasswordSubmitting ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {signupPasswordSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSubmitSignupPassword ? '#fff' : '#9B9B9B' },
                        ]}>
                        Continue
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
                </>
              ) : (
                <>
                <View style={styles.forgotHeader}>
                  <View style={styles.topBarRow}>
                    <Pressable
                      onPress={goBackToSignupPassword}
                      accessibilityLabel="Back to set password"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <ThemedText style={styles.backChevron}>‹</ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={goCloseSignup}
                      accessibilityLabel="Close sign up"
                      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
                      <CloseIcon />
                    </Pressable>
                  </View>
                  <View style={styles.signupVerifyHeader}>
                    <SignupStepper done={3} />
                    <View style={styles.header}>
                      <ThemedText style={styles.title}>Let&rsquo;s get to know you</ThemedText>
                      <ThemedText style={styles.subtitle}>
                        Add your name and how you&rsquo;ll appear in the community:
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.credentialsBody}>
                  <View style={styles.credentialsFields}>
                    <Pressable onPress={() => firstNameRef.current?.focus()} style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        First name
                      </ThemedText>
                      <TextInput
                        ref={firstNameRef}
                        value={firstName}
                        onChangeText={(v) => {
                          setFirstName(v);
                          if (firstNameError) setFirstNameError(null);
                        }}
                        placeholder="Enter your first name"
                        placeholderTextColor="#9B9B9B"
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoComplete="name-given"
                        textContentType="givenName"
                        returnKeyType="next"
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                        blurOnSubmit={false}
                        onFocus={() => setFirstNameFocused(true)}
                        onBlur={() => setFirstNameFocused(false)}
                        style={[
                          styles.input,
                          {
                            backgroundColor:
                              firstNameError ? '#F5F5F5' : firstNameFocused ? '#F5F5F5' : '#FFFFFF',
                            borderColor:
                              firstNameError ? '#A50000' : firstNameFocused ? '#1B87E6' : '#9B9B9B',
                          },
                        ]}
                      />
                      {firstNameError && (
                        <ThemedText style={styles.inlineError}>{firstNameError}</ThemedText>
                      )}
                    </Pressable>

                    <Pressable onPress={() => lastNameRef.current?.focus()} style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        Last name
                      </ThemedText>
                      <TextInput
                        ref={lastNameRef}
                        value={lastName}
                        onChangeText={(v) => {
                          setLastName(v);
                          if (lastNameError) setLastNameError(null);
                        }}
                        placeholder="Enter your last name"
                        placeholderTextColor="#9B9B9B"
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoComplete="name-family"
                        textContentType="familyName"
                        returnKeyType="next"
                        onSubmitEditing={() => usernameRef.current?.focus()}
                        blurOnSubmit={false}
                        onFocus={() => setLastNameFocused(true)}
                        onBlur={() => setLastNameFocused(false)}
                        style={[
                          styles.input,
                          {
                            backgroundColor:
                              lastNameError ? '#F5F5F5' : lastNameFocused ? '#F5F5F5' : '#FFFFFF',
                            borderColor:
                              lastNameError ? '#A50000' : lastNameFocused ? '#1B87E6' : '#9B9B9B',
                          },
                        ]}
                      />
                      {lastNameError && (
                        <ThemedText style={styles.inlineError}>{lastNameError}</ThemedText>
                      )}
                    </Pressable>

                    <Pressable onPress={() => usernameRef.current?.focus()} style={styles.field}>
                      <ThemedText type="smallBold" style={styles.label}>
                        Username
                      </ThemedText>
                      <TextInput
                        ref={usernameRef}
                        value={username}
                        onChangeText={(v) => {
                          setUsername(v);
                          if (usernameError) setUsernameError(null);
                        }}
                        placeholder="Enter your username"
                        placeholderTextColor="#9B9B9B"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="username"
                        textContentType="username"
                        returnKeyType="done"
                        onSubmitEditing={onSubmitProfile}
                        onFocus={() => setUsernameFocused(true)}
                        onBlur={() => setUsernameFocused(false)}
                        style={[
                          styles.input,
                          {
                            backgroundColor:
                              usernameError ? '#F5F5F5' : usernameFocused ? '#F5F5F5' : '#FFFFFF',
                            borderColor:
                              usernameError ? '#A50000' : usernameFocused ? '#1B87E6' : '#9B9B9B',
                          },
                        ]}
                      />
                      {usernameError && (
                        <ThemedText style={styles.inlineError}>{usernameError}</ThemedText>
                      )}
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={onSubmitProfile}
                    disabled={!canSubmitProfile || profileSubmitting}
                    accessibilityLabel="Continue"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: canSubmitProfile ? '#1B87E6' : '#F0F0F0',
                        opacity: profileSubmitting ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    {profileSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.primaryButtonText,
                          { color: canSubmitProfile ? '#fff' : '#9B9B9B' },
                        ]}>
                        Continue
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        <View style={styles.poweredBy}>
          <ThemedText type="small" style={{ fontFamily: Fonts.regular, color: '#9B9B9B' }}>
            Powered by{' '}
          </ThemedText>
          <Pressable onPress={() => {}}>
            <ThemedText type="small" style={styles.poweredByLink}>
              QuestionPro
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

// Figma 105:1851 (access code) + 119:2174 (credentials) + 119:2016 (signup)
// + 133:2298 (forgot) + 133:2389 (forgot verify) + 133:2472 (reset)
// + 128:2315 (signup verify) + 132:3022 (signup password)
// + 133:1796 (signup profile) spacing
// (Spacing: one 4, two 8, three 16, four 24, five 32, six 64):
// Safe Area: paddingH 24, paddingTop 24, paddingBottom 8
// Main col: gap 64 (header ↔ body); body gap 32 (fields ↔ button ↔ divider ↔ SSO)
// Header: gap 8; title 24/32 SemiBold #1B3380; subtitle 16/24 Regular #9B9B9B
// Forgot header: gap 32 (topbar 32x32 radius4 rgba(0,0,0,0.04) ↔ title group)
// Screen 1 form: gap 32; field gap 4 (label 12/16 #545E6B + input h48 radius6 paddingH 8, text 14/16)
// Screen 2: credentialsBody gap 32; credentialsFields gap 16; passwordBlock gap 16;
//   forgot 14/16 #1B87E6 left; divider gap 16 (text 14/16 #9B9B9B);
//   sso row gap 16, buttons flex1 h48 radius6 border rgba(0,0,0,0.2)
// Button: h40 min-h40 radius8 bg #1B87E6 text 16 white, full width
// Error: inline 12/16 #A50000 below input; input error border #A50000 bg #F5F5F5
// Illustration (Screen 1 only): 207x160 bottom-right; footer "Powered by" 12/18 centered
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
    paddingBottom: Spacing.two,
  },
  main: {
    flex: 1,
    alignSelf: 'stretch',
    gap: Spacing.six,
  },
  header: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  forgotHeader: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: Spacing.five,
  },
  signupVerifyHeader: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: Spacing.five,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'stretch',
  },
  stepSeg: {
    flex: 1,
    height: 4,
    borderRadius: 20,
  },
  stepDone: {
    backgroundColor: '#1B87E6',
  },
  stepTodo: {
    backgroundColor: 'rgba(27, 135, 230, 0.15)',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  iconButtonSpacer: {
    width: 32,
    height: 32,
    opacity: 0,
  },
  recipientText: {
    textAlign: 'left',
    alignSelf: 'stretch',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  verifyBody: {
    alignSelf: 'stretch',
    gap: Spacing.five,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  codeBox: {
    flex: 1,
    height: 64,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: '#545E6B',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  inlineErrorCenter: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#A50000',
    textAlign: 'center',
  },
  resendPress: {
    alignSelf: 'center',
  },
  resendLink: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: '#1B87E6',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: Fonts.semiBold,
    color: '#1B3380',
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: '#9B9B9B',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#1B87E6',
  },
  form: {
    alignSelf: 'stretch',
    gap: Spacing.five,
  },
  credentialsBody: {
    alignSelf: 'stretch',
    gap: Spacing.five,
  },
  credentialsFields: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  passwordBlock: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  resetFields: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  reqLabel: {
    fontSize: 12,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: '#9B9B9B',
  },
  reqList: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  reqBullet: {
    width: 16,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  reqMet: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#42BD84',
  },
  reqUnmet: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  resetNote: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: '#42BD84',
    textAlign: 'center',
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#545E6B',
  },
  input: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9B9B9B',
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingHorizontal: Spacing.two,
    paddingVertical: 0,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#545E6B',
    textAlignVertical: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9B9B9B',
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.two,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#545E6B',
    textAlignVertical: 'center',
  },
  showPress: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  forgotText: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#1B87E6',
  },
  inlineError: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#A50000',
  },
  primaryButton: {
    minHeight: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1B87E6',
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#9B9B9B',
  },
  ssoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  ssoButton: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: '#545E6B',
    textAlign: 'center',
  },
  illustrationWrap: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  poweredBy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  poweredByLink: {
    color: '#1B87E6',
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
