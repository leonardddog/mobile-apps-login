import {
  FiraSans_400Regular,
  FiraSans_500Medium,
  FiraSans_600SemiBold,
  FiraSans_700Bold,
  useFonts,
} from '@expo-google-fonts/fira-sans';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionProvider, useSession } from '@/ctx';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    FiraSans_400Regular,
    FiraSans_500Medium,
    FiraSans_600SemiBold,
    FiraSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <SessionProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
          <RootSplashController fontsLoaded={fontsLoaded} fontError={fontError} />
          <AnimatedSplashOverlay />
          <RootNavigator />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootSplashController({
  fontsLoaded,
  fontError,
}: {
  fontsLoaded: boolean;
  fontError: Error | null | undefined;
}) {
  const { isLoading } = useSession();

  useEffect(() => {
    if ((!isLoading && (fontsLoaded || !!fontError)) || fontError) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded, fontError]);

  return null;
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="login-menu" />
        <Stack.Screen name="sign-in" options={{ gestureEnabled: true }} />
        <Stack.Screen name="login-sheets" options={{ gestureEnabled: true }} />
        <Stack.Screen name="login-unified" options={{ gestureEnabled: true }} />
      </Stack.Protected>
    </Stack>
  );
}
