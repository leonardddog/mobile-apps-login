import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useSession } from '@/ctx';

// Deprecated in favor of RootSplashController in src/app/_layout.tsx which
// coordinates both auth + Fira Sans font loading. Kept for backwards compat.
export function SplashScreenController() {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}
