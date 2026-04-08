import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, StatusBar, RefreshControl, Animated
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons'
import { Alert } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { getBaseUrl } from '../config'
import { AlertCard } from '../types'

const { width } = Dimensions.get('window')
const AMBER = '#f59e0b'
const BG = '#050505' // Deep premium dark mode

// Mock retail KPI data
const MOCK_KPIS = [
  { label: 'Revenue (7d)', value: '₹4,87,320', sub: '+18.1% vs last week', icon: 'trending-up', color: AMBER, up: true },
  { label: 'Low Stock Items', value: '7', sub: 'Across 3 stores', icon: 'alert-circle', color: '#ef4444', up: false },
  { label: 'Units Sold (7d)', value: '3,241', sub: '+8.4% vs last week', icon: 'cart', color: '#22c55e', up: true },
]

const MOCK_CHART = {
  labels: ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7'],
  datasets: [{ data: [38000, 51000, 44000, 62000, 58000, 73000, 81000], color: () => AMBER, strokeWidth: 3 }],
}

const ALERT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = { critical: 'alert-circle', warning: 'warning', success: 'checkmark-circle', info: 'information-circle' }
const ALERT_COLOR: Record<string, string> = { critical: '#ef4444', warning: AMBER, success: '#22c55e', info: '#3b82f6' }

export default function InsightsScreen() {
  const [kpis, setKpis] = useState<any[]>([])
  const [chart, setChart] = useState<any>(MOCK_CHART)
  const [alerts, setAlerts] = useState<AlertCard[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ label: string, value: number } | null>(null)

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current
  const cardsScale = useRef(new Animated.Value(0.95)).current
  const cardsOpacity = useRef(new Animated.Value(0)).current
  const chartTranslate = useRef(new Animated.Value(40)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(cardsScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
      ]),
      Animated.spring(chartTranslate, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start()
  }, [])

  const fetchInsights = async () => {
    try {
      const base = await getBaseUrl()
      const res = await fetch(`${base}/api/insights`)
      if (res.ok) {
        const data = await res.json()
        if (data.metrics) {
          setKpis(data.metrics.map((m: any) => ({
            label: m.title, value: m.value, sub: 'Live Data',
            icon: m.type === 'critical' ? 'alert-circle' : m.type === 'success' ? 'trending-up' : 'cart',
            color: ALERT_COLOR[m.type] || AMBER, up: m.type === 'success'
          })))
        }
        if (data.chartData) {
          setChart({ labels: data.chartData.labels, datasets: [{ ...data.chartData.datasets[0], color: () => AMBER, strokeWidth: 3 }] })
        }
        setAlerts(data.alerts || [])
      } else {
         throw new Error('API Error')
      }
    } catch {
      setKpis(MOCK_KPIS)
      setChart(MOCK_CHART)
      setAlerts([
        { type: 'critical', title: '3 Items Low on Stock', description: 'Maggi Noodles @ Sitabuldi: 8 left · Amul Butter: 5 left', value: '3 items' },
        { type: 'success', title: 'Revenue Up 18%', description: 'Last 7d vs previous week across all stores', value: '₹4,87,320' },
      ])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchInsights() }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchInsights()
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={['#f59e0b08', '#00000000', '#7c3aed05']} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AMBER} />}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitle}>Retail Insights</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </Animated.View>

        {/* KPI Cards (Glassmorphic) */}
        <Animated.View style={{ opacity: cardsOpacity, transform: [{ scale: cardsScale }], gap: 14 }}>
          {(kpis.length > 0 ? kpis : MOCK_KPIS).map((kpi, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => Alert.alert(kpi.label, `Current Value: ${kpi.value}\nStatus: ${kpi.sub}`)}>
              <BlurView intensity={20} tint="dark" style={styles.kpiCard}>
                <View style={styles.kpiLeft}>
                  <LinearGradient colors={[`${kpi.color}30`, `${kpi.color}05`]} style={styles.kpiIconBox}>
                    <Ionicons name={kpi.icon as keyof typeof Ionicons.glyphMap} size={20} color={kpi.color} />
                  </LinearGradient>
                  <View>
                    <Text style={styles.kpiValue}>{String(kpi.value).replace('$', '₹')}</Text>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  </View>
                </View>
                <View style={styles.kpiRight}>
                  <Ionicons name={kpi.up ? 'trending-up' : 'trending-down'} size={18} color={kpi.up ? '#22c55e' : '#ef4444'} />
                  <Text style={[styles.kpiSub, { color: kpi.up ? '#22c55e' : '#ef4444' }]}>{kpi.sub}</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Revenue Chart */}
        <Animated.View style={[styles.chartWrapper, { opacity: cardsOpacity, transform: [{ translateY: chartTranslate }] }]}>
          <BlurView intensity={20} tint="dark" style={styles.chartCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={styles.chartTitle}>Revenue Flow</Text>
                <Text style={styles.chartSubtitle}>Last 7 Days Performance</Text>
              </View>
              {selectedDay && (
                <View style={styles.selectedDayBadge}>
                  <Text style={styles.selectedDayText}>₹{selectedDay.value}</Text>
                </View>
              )}
            </View>
            <LineChart
              data={chart}
              width={width - 56}
              height={190}
              withShadow={true}
              chartConfig={{
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                labelColor: () => '#9ca3af',
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#050505', fill: AMBER },
                propsForBackgroundLines: { stroke: '#ffffff1a', strokeDasharray: '3 3' },
              }}
              bezier
              style={styles.chart}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              onDataPointClick={({ value, index }) => {
                setSelectedDay({ label: chart.labels[index], value })
              }}
            />
          </BlurView>
        </Animated.View>

        {/* Live Alerts */}
        <Text style={styles.sectionTitle}>Real-time Radar</Text>
        {loading ? (
          <ActivityIndicator color={AMBER} style={{ marginTop: 16 }} />
        ) : alerts.map((card, i) => (
          <BlurView key={i} intensity={30} tint="dark" style={[styles.alertCard, { borderColor: ALERT_COLOR[card.type] + '40', shadowColor: ALERT_COLOR[card.type] }]}>
            <View style={[styles.alertDot, { backgroundColor: ALERT_COLOR[card.type] + '20' }]}>
              <Ionicons name={ALERT_ICON[card.type]} size={18} color={ALERT_COLOR[card.type]} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.alertRow}>
                <Text style={[styles.alertTitle, { color: ALERT_COLOR[card.type] }]}>{card.title}</Text>
                {card.value && <Text style={[styles.alertValue, { color: ALERT_COLOR[card.type] }]}>{card.value}</Text>}
              </View>
              <Text style={styles.alertDesc}>{card.description}</Text>
            </View>
          </BlurView>
        ))}
        {/* Padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 10, gap: 14 },
  header: { marginBottom: 12 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  headerSub: { fontSize: 13, color: '#9ca3af', marginTop: 4, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
  
  kpiCard: {
    borderRadius: 20, borderWidth: 1, borderColor: '#ffffff15', overflow: 'hidden',
    padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff0a',
  },
  kpiLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  kpiIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff0f' },
  kpiValue: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  kpiLabel: { fontSize: 13, fontWeight: '600', color: '#9ca3af', marginTop: 2 },
  kpiRight: { alignItems: 'flex-end', justifyContent: 'center' },
  kpiSub: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  
  chartWrapper: { marginTop: 8 },
  chartCard: { borderRadius: 24, borderWidth: 1, borderColor: '#ffffff15', padding: 20, backgroundColor: '#ffffff08', overflow: 'hidden' },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  chartSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  selectedDayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#f59e0b20', borderWidth: 1, borderColor: '#f59e0b40' },
  selectedDayText: { fontSize: 13, color: AMBER, fontWeight: '700' },
  chart: { marginLeft: -12 },
  
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 12, marginLeft: 4 },
  alertCard: {
    borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#ffffff05', overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  alertDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  alertTitle: { fontSize: 14, fontWeight: '800', flex: 1, letterSpacing: -0.2 },
  alertValue: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  alertDesc: { fontSize: 12, color: '#9ca3af', lineHeight: 18 },
})
