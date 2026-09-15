import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

// Menu of login approaches, shown first after splash for logged-out users.
// To add an approach: create its screen under src/app/, register a
// Stack.Screen in src/app/_layout.tsx, and append one entry here.
const APPROACHES = [
  {
    name: 'Classic',
    tag: 'Current',
    description: 'Stacked form on the drifting dots background',
    href: '/sign-in' as const,
  },
  {
    name: 'Sheets',
    tag: 'New',
    description: 'Log in and sign up open as bottom sheets',
    href: '/login-sheets' as const,
  },
];

export default function LoginMenuScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="title" style={[styles.title, { color: '#1B3380' }]}>
                Login approaches
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Pick a design to preview
              </ThemedText>
            </View>

            <View style={styles.list}>
              {APPROACHES.map((approach) => (
                <Pressable
                  key={approach.href}
                  onPress={() => router.push(approach.href)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <View style={styles.rowText}>
                    <View style={styles.nameRow}>
                      <ThemedText type="smallBold" style={styles.name}>
                        {approach.name}
                      </ThemedText>
                      <View style={styles.tag}>
                        <ThemedText style={styles.tagText}>{approach.tag}</ThemedText>
                      </View>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
                      {approach.description}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.chevron}>›</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.five,
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
  list: {
    alignSelf: 'stretch',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
  },
  tag: {
    backgroundColor: '#E8F1FE',
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: '#1B87E6',
  },
  desc: {
    fontFamily: Fonts.regular,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts.regular,
    color: '#9B9B9B',
  },
});
