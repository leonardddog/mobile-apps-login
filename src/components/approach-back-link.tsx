import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';

// Shared back affordance for login-approach screens (headers stay hidden
// app-wide, so each variant links back to the approaches menu explicitly).
export function ApproachBackLink({ label = 'Approaches' }: { label?: string }) {
  return (
    <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backPress}>
      <ThemedText style={styles.backText}>‹ {label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backPress: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
    paddingRight: Spacing.two,
  },
  backText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: '#3c87f7',
  },
});
