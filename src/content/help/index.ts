import articles from './articles'

export type HelpLocale = 'pt-BR' | 'en-US' | 'es-ES'

type Localized<T> = Record<HelpLocale, T>

export type HelpArticleJson = {
  title: Localized<string>
  summary: Localized<string>
  body: Localized<readonly string[]>
  faqs: Localized<readonly { q: string; a: string }[]>
}

export const HELP_ARTICLES = articles as unknown as Record<
  string,
  HelpArticleJson
>

export const listHelpSlugs = (): string[] => Object.keys(HELP_ARTICLES)

export const resolveHelpLocale = (language: string): HelpLocale => {
  if (language.startsWith('en')) return 'en-US'
  if (language.startsWith('es')) return 'es-ES'
  return 'pt-BR'
}

export const getHelpArticle = (slug: string, language: string) => {
  const article = HELP_ARTICLES[slug]
  if (!article) return null
  const locale = resolveHelpLocale(language)
  return {
    slug,
    title: article.title[locale] ?? article.title['pt-BR'],
    summary: article.summary[locale] ?? article.summary['pt-BR'],
    body: [...(article.body[locale] ?? article.body['pt-BR'])],
    faqs: [...(article.faqs[locale] ?? article.faqs['pt-BR'])],
  }
}
