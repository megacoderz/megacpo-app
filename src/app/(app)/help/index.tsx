import { router, type Href } from 'expo-router'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Button, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { getHelpArticle, listHelpSlugs } from '@/content/help'

export default function PartnerHelpHubScreen() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const items = listHelpSlugs()
    .map((slug) => getHelpArticle(slug, i18n.language))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.text }]}>
        {t('help.hubTitle')}
      </Text>
      <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
        {t('help.disclaimer')}
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/help/${item.slug}` as Href)}
            style={[styles.card, { borderColor: theme.border }]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={{ color: theme.textSecondary }}>{item.summary}</Text>
          </Pressable>
        )}
      />
      <View style={styles.cta}>
        <Button onPress={() => router.back()} variant="secondary">
          {t('common.back')}
        </Button>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.half,
    padding: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cta: {
    marginTop: Spacing.two,
  },
  disclaimer: {
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
})
