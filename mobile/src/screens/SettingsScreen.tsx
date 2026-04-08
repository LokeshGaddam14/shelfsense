import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Switch, ScrollView, StatusBar, Alert, Animated
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { getBaseUrl, setBaseUrl, DEFAULT_BASE_URL } from '../config'

const AMBER = '#f59e0b'
const BG = '#050505' // Deep premium dark mode

type Role = 'MANAGER' | 'WORKER' | null

export default function SettingsScreen() {
  const [url, setUrl] = useState(DEFAULT_BASE_URL)
  const [saved, setSaved] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  
  // Auth State
  const [role, setRole] = useState<Role>(null)
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    getBaseUrl().then(setUrl)
    AsyncStorage.getItem('USER_ROLE').then(r => setRole(r as Role))
    
    // Premium Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
    ]).start()
  }, [])

  const handleSave = async () => {
    if (!url.startsWith('http')) {
      Alert.alert('Invalid URL', 'URL must start with http:// or https://')
      return
    }
    await setBaseUrl(url.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogin = async (selectedRole: Role) => {
    if (!selectedRole) return
    await AsyncStorage.setItem('USER_ROLE', selectedRole)
    setRole(selectedRole)
    Alert.alert('Authenticating...', `Access granted as ${selectedRole}.`)
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('USER_ROLE')
    setRole(null)
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={['#f59e0b06', '#00000000', '#f59e0b02']} style={StyleSheet.absoluteFillObject} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.heading}>Preferences</Text>

          {/* Authentication */}
          <BlurView intensity={20} tint="dark" style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            {role ? (
              <View style={styles.profileCard}>
                <LinearGradient colors={['#f59e0b30', '#f59e0b05']} style={styles.profileIcon}>
                  <Text style={styles.profileAvatarText}>{role === 'MANAGER' ? 'M' : 'W'}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{role === 'MANAGER' ? 'Anjali Sharma' : 'Rahul Kumar'}</Text>
                  <Text style={styles.profileRole}>{role}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                  <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <Text style={styles.sectionHint}>Sign in to unlock personalized retail intelligence.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleLogin('MANAGER')} activeOpacity={0.8} style={styles.loginBtn}>
                    <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name="briefcase-outline" size={16} color="#050505" />
                      <Text style={styles.loginBtnText}>Manager</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleLogin('WORKER')} activeOpacity={0.8} style={[styles.loginBtn, { backgroundColor: '#ffffff0a', borderWidth: 1, borderColor: '#ffffff20' }]}>
                    <View style={styles.loginGradient}>
                      <Ionicons name="people-outline" size={16} color="#9ca3af" />
                      <Text style={[styles.loginBtnText, { color: '#e5e7eb' }]}>Worker</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </BlurView>

          {/* Configuration */}
          <BlurView intensity={20} tint="dark" style={styles.section}>
            <Text style={styles.sectionLabel}>NETWORK</Text>
            <Text style={styles.sectionHint}>
              Sync your mobile device directly with the local host machine running the Next.js API.
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons name="globe-outline" size={16} color="#6b7280" style={{ marginRight: 10 }} />
              <TextInput
                value={url}
                onChangeText={setUrl}
                style={styles.input}
                placeholder="http://192.168.x.x:3000"
                placeholderTextColor="#4b5563"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {url !== '' && (
                <TouchableOpacity onPress={() => setUrl('')}>
                  <Ionicons name="close-circle" size={18} color="#4b5563" />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity activeOpacity={0.8} style={[styles.saveBtnWrap, saved && styles.saveBtnSuccessWrap]} onPress={handleSave}>
              <LinearGradient colors={saved ? ['#22c55e', '#16a34a'] : ['#f59e0b2a', '#f59e0b10']} style={styles.saveBtn}>
                <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={18} color={saved ? '#fff' : AMBER} />
                <Text style={[styles.saveBtnText, Object.assign({}, saved ? { color: '#fff' } : {})]}>
                  {saved ? 'Synchronized!' : 'Save Connection'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setUrl(DEFAULT_BASE_URL)} style={styles.resetLink}>
              <Text style={styles.resetText}>Reset to Default</Text>
            </TouchableOpacity>
          </BlurView>

          {/* Theme toggle */}
          <BlurView intensity={20} tint="dark" style={styles.section}>
            <Text style={styles.sectionLabel}>APPEARANCE</Text>
            <View style={styles.themeRow}>
              <View>
                <Text style={styles.themeLabel}>Immersive Dark Mode</Text>
                <Text style={styles.themeHint}>Provides true blacks and deeper contrast</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#374151', true: AMBER + '60' }}
                thumbColor={darkMode ? AMBER : '#6b7280'}
              />
            </View>
          </BlurView>

          {/* About */}
          <BlurView intensity={20} tint="dark" style={styles.section}>
            <Text style={styles.sectionLabel}>SYSTEM</Text>
            <View style={styles.aboutCard}>
              <Ionicons name="sparkles" size={24} color={AMBER} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutTitle}>ShelfSense Mobile</Text>
                <Text style={styles.aboutSub}>Retail Intelligence Engine · v2.0.0</Text>
              </View>
            </View>
          </BlurView>
          
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 16 },
  heading: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 8 },
  section: {
    borderRadius: 24, borderWidth: 1, borderColor: '#ffffff15', padding: 20, gap: 16, marginBottom: 16, backgroundColor: '#ffffff0a', overflow: 'hidden'
  },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionHint: { fontSize: 13, color: '#9ca3af', lineHeight: 20 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff08', borderRadius: 16,
    borderWidth: 1, borderColor: '#ffffff1a', paddingHorizontal: 16, paddingVertical: 14,
  },
  input: { flex: 1, color: '#e5e7eb', fontSize: 14, fontFamily: 'monospace' },
  
  saveBtnWrap: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f59e0b40' },
  saveBtnSuccessWrap: { borderColor: '#22c55e' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: AMBER, letterSpacing: 0.5 },
  resetLink: { alignSelf: 'center', marginTop: 4 },
  resetText: { fontSize: 13, color: '#6b7280', textDecorationLine: 'underline' },
  
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  themeLabel: { fontSize: 15, fontWeight: '700', color: '#e5e7eb' },
  themeHint: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  
  aboutCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 4 },
  aboutTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  aboutSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f59e0b40' },
  profileAvatarText: { fontSize: 20, fontWeight: '900', color: AMBER },
  profileName: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  profileRole: { fontSize: 11, color: '#f59e0b', fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#ef444415', borderRadius: 12, borderWidth: 1, borderColor: '#ef444430' },
  logoutText: { fontSize: 13, color: '#ef4444', fontWeight: '700' },
  
  loginBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  loginGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  loginBtnText: { fontSize: 14, fontWeight: '800', color: '#050505' },
})
