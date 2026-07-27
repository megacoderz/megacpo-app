import { useCallback, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'

import { Card, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import {
  partnerService,
  type PartnerEarnings,
  type PartnerInvoiceSplit,
} from '@/services/partner.service'
import { getApiErrorMessage } from '@/utils/api-error-message'

const EARNINGS_STATUS_KEY: Record<string, string> = {
  failed: 'earnings.statusLabel.failed',
  pending: 'earnings.statusLabel.pending',
  skipped: 'earnings.statusLabel.skipped',
  transferred: 'earnings.statusLabel.transferred',
}

const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function EarningsScreen() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [earnings, setEarnings] = useState<PartnerEarnings | undefined>()
  const [fromMonth, setFromMonth] = useState(currentMonth)
  const [toMonth, setToMonth] = useState(currentMonth)
  const [appliedFrom, setAppliedFrom] = useState(currentMonth)
  const [appliedTo, setAppliedTo] = useState(currentMonth)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')

  const formatCents = useMemo(
    () => (cents: number) =>
      (cents / 100).toLocaleString(i18n.language || 'pt-BR', {
        currency: 'BRL',
        style: 'currency',
      }),
    [i18n.language],
  )

  const load = useCallback(
    async (isRefresh = false) => {
      setError('')
      if (isRefresh) {
        setIsRefreshing(true)
      }

      try {
        const result = await partnerService.getEarnings({
          fromMonth: appliedFrom,
          toMonth: appliedTo,
        })
        setEarnings(result)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, t))
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [appliedFrom, appliedTo, t],
  )

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const handleApplyPeriod = () => {
    setAppliedFrom(fromMonth)
    setAppliedTo(toMonth)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setError('')
    try {
      const csv = await partnerService.exportEarningsCsv(fromMonth)
      await Share.share({
        message: csv,
        title: t('earnings.exportTitle', { month: fromMonth }),
      })
    } catch (exportError) {
      setError(getApiErrorMessage(exportError, t))
    } finally {
      setIsExporting(false)
    }
  }

  const renderItem = ({ item }: { item: PartnerInvoiceSplit }) => (
    <Card style={styles.item}>
      <View style={styles.itemRow}>
        <Text style={[styles.itemValue, { color: theme.text }]}>
          {formatCents(item.shareCents)}
        </Text>
        <Text style={[styles.itemStatus, { color: theme.textSecondary }]}>
          {t(
            EARNINGS_STATUS_KEY[item.status] ?? 'earnings.statusLabel.pending',
          )}
        </Text>
      </View>
      <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
        {t('earnings.splitPercent', { percent: item.splitPercent })}
      </Text>
      <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
        {new Date(item.createdAt).toLocaleDateString(i18n.language || 'pt-BR')}
      </Text>
    </Card>
  )

  if (isLoading) {
    return (
      <Screen scroll={false} style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
      </Screen>
    )
  }

  return (
    <Screen scroll={false} style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={earnings?.items ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            {t('earnings.empty')}
          </Text>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('earnings.title')}
            </Text>
            <View style={styles.filters}>
              <TextInput
                accessibilityLabel={t('earnings.from')}
                onChangeText={setFromMonth}
                placeholder="YYYY-MM"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.monthInput,
                  { borderColor: theme.border, color: theme.text },
                ]}
                value={fromMonth}
              />
              <TextInput
                accessibilityLabel={t('earnings.to')}
                onChangeText={setToMonth}
                placeholder="YYYY-MM"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.monthInput,
                  { borderColor: theme.border, color: theme.text },
                ]}
                value={toMonth}
              />
              <Pressable
                accessibilityRole="button"
                onPress={handleApplyPeriod}
                style={[
                  styles.filterButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.filterButtonText}>
                  {t('earnings.applyPeriod')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isExporting}
                onPress={() => void handleExport()}
                style={[
                  styles.filterButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.filterButtonText}>
                  {isExporting
                    ? t('earnings.exporting')
                    : t('earnings.exportCsv')}
                </Text>
              </Pressable>
            </View>
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  {t('earnings.totalTransferred')}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.success }]}>
                  {formatCents(earnings?.totalTransferredCents ?? 0)}
                </Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  {t('earnings.totalPending')}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.warning }]}>
                  {formatCents(earnings?.totalPendingCents ?? 0)}
                </Text>
              </Card>
            </View>
            {error ? (
              <Text style={[styles.errorMessage, { color: theme.danger }]}>
                {error}
              </Text>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[theme.primary]}
            onRefresh={() => void load(true)}
            refreshing={isRefreshing}
            tintColor={theme.primary}
          />
        }
        renderItem={renderItem}
        style={styles.list}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontSize: 14,
    marginTop: Spacing.four,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
  },
  filterButton: {
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  item: {
    marginBottom: Spacing.two,
  },
  itemMeta: {
    fontSize: 13,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    padding: Spacing.three,
  },
  monthInput: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 110,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  screen: {
    padding: 0,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
})
