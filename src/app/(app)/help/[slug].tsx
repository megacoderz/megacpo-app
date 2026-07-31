import { useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { getHelpArticle } from '@/content/help'

export default function PartnerHelpArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const article = getHelpArticle(String(slug ?? ''), i18n.language)

  if (!article) {
    return (
      <Screen>
        <Text style={{ color: theme.text }}>{t('help.notFound')}</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {article.title}
        </Text>
        <Text style={{ color: theme.textSecondary }}>{article.summary}</Text>
        <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
          {t('help.disclaimer')}
        </Text>
        {article.body.map((paragraph) => (
          <Text
            key={paragraph}
            style={[styles.paragraph, { color: theme.text }]}
          >
            {paragraph}
          </Text>
        ))}
        <Text style={[styles.faqTitle, { color: theme.text }]}>
          {t('help.faqTitle')}
        </Text>
        {article.faqs.map((item) => (
          <View key={item.q} style={styles.faqItem}>
            <Text style={[styles.faqQ, { color: theme.text }]}>{item.q}</Text>
            <Text style={{ color: theme.textSecondary }}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  disclaimer: {
    fontSize: 12,
  },
  faqItem: {
    gap: Spacing.half,
  },
  faqQ: {
    fontWeight: '700',
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
})
