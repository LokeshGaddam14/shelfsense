import React, { useRef, useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Dimensions
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

const { width, height } = Dimensions.get('window')
const AMBER = '#f59e0b'
const BG = '#050505' // Deep matte black

interface Props {
  navigation: { navigate: (screen: string) => void }
}

export default function WelcomeScreen({ navigation }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fade1 = useRef(new Animated.Value(0)).current
  const fade2 = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(40)).current
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    // Elegant entrance animation
    Animated.parallel([
      Animated.timing(fade1, { toValue: 1, duration: 1000, delay: 200, useNativeDriver: true }),
      Animated.timing(fade2, { toValue: 1, duration: 1000, delay: 400, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 40, delay: 400, useNativeDriver: true }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Deep premium gradient background */}
      <LinearGradient colors={['#0f172a00', '#f59e0b11']} style={styles.absoluteTarget} />
      
      {/* Animated glowing orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ scale: pulseAnim }], opacity: fade1 }]} />
      <Animated.View style={[styles.orb2, { transform: [{ scale: pulseAnim }], opacity: fade1 }]} />

      <View style={styles.content}>
        <Animated.View style={{ opacity: fade1, alignItems: 'center' }}>
          <View style={styles.iconContainer}>
            <LinearGradient colors={['#f59e0b33', '#f59e0b05']} style={styles.iconBg}>
              <Ionicons name="scan-outline" size={38} color={AMBER} />
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textWrap, { opacity: fade2, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.appName}>ShelfSense</Text>
          <Text style={styles.tagline}>Retail Intelligence.</Text>
          <Text style={styles.subtext}>
            Master your inventory, track revenue trends, and make smarter decisions with AI.
          </Text>
        </Animated.View>
      </View>

      {/* Glassmorphic Bottom Panel */}
      <Animated.View style={[styles.bottomPanel, { opacity: fade2, transform: [{ translateY: slideUp }] }]}>
        {/* We use View with transparent background if BlurView degrades perf, but BlurView looks $10k */}
        <BlurView intensity={30} tint="dark" style={styles.glassContainer}>
          <TouchableOpacity
            style={[styles.buttonWrapper, pressed && styles.pressed]}
            activeOpacity={0.9}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={() => navigation.navigate('Main')}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#050505" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.footerText}>Powered by Gemini 2.0 Flash</Text>
        </BlurView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  absoluteTarget: { ...StyleSheet.absoluteFillObject },
  orb1: {
    position: 'absolute', top: height * 0.1, left: -width * 0.2,
    width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
    backgroundColor: '#f59e0b1a', filter: 'blur(40px)', // Expo doesn't support filter exactly, but blurview handles it
  },
  orb2: {
    position: 'absolute', bottom: height * 0.2, right: -width * 0.3,
    width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45,
    backgroundColor: '#7c3aed15',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 60 },
  iconContainer: {
    marginBottom: 40, padding: 4, borderRadius: 32,
    borderWidth: 1, borderColor: '#f59e0b30', shadowColor: AMBER, shadowOpacity: 0.2, shadowRadius: 20,
  },
  iconBg: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  textWrap: { alignItems: 'center' },
  appName: { fontSize: 44, fontWeight: '900', color: '#ffffff', letterSpacing: -1.5, marginBottom: 8 },
  tagline: { fontSize: 22, color: AMBER, fontWeight: '600', letterSpacing: -0.5, marginBottom: 16 },
  subtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  bottomPanel: { position: 'absolute', bottom: 40, left: 24, right: 24, borderRadius: 24, overflow: 'hidden' },
  glassContainer: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#ffffff1a', backgroundColor: '#ffffff05' },
  buttonWrapper: { borderRadius: 18, overflow: 'hidden', shadowColor: AMBER, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  ctaText: { color: '#050505', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  footerText: { textAlign: 'center', color: '#6b7280', fontSize: 11, marginTop: 16, fontWeight: '500', letterSpacing: 0.3 },
})
