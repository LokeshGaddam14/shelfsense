import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator, StatusBar, Alert, Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as Speech from 'expo-speech'
import * as FileSystem from 'expo-file-system'
import { BlurView } from 'expo-blur'
import { getBaseUrl } from '../config'
import { Message } from '../types'

const { width } = Dimensions.get('window')
const AMBER = '#f59e0b'
const BG = '#050505' // Matching deep mode

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: { extension: '.m4a', outputFormat: Audio.AndroidOutputFormat.MPEG_4, audioEncoder: Audio.AndroidAudioEncoder.AAC, sampleRate: 16000, numberOfChannels: 1, bitRate: 64000 },
  ios: { extension: '.m4a', outputFormat: Audio.IOSOutputFormat.MPEG4AAC, audioQuality: Audio.IOSAudioQuality.MEDIUM, sampleRate: 16000, numberOfChannels: 1, bitRate: 64000, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false },
  web: { mimeType: 'audio/webm', bitsPerSecond: 64000 },
}

const CHIPS = [
  { id: 'low-stock', label: '📦 Low Stock', query: 'Which products are running low on stock?' },
  { id: 'revenue', label: '📈 Revenue', query: 'Show me revenue trend for last 14 days' },
  { id: 'reorder', label: '🔄 Reorder List', query: 'Give me a complete reorder list' },
  { id: 'top-sellers', label: '🏆 Top Sellers', query: 'Top 5 best selling products this month' },
]

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  const entranceAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    Animated.spring(entranceAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start()
  }, [])

  return (
    <Animated.View style={[
      styles.bubbleRow, 
      isUser ? styles.rowRight : styles.rowLeft,
      { opacity: entranceAnim, transform: [{ scale: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }
    ]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={12} color={AMBER} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{msg.content}</Text>
        <Text style={[styles.timestamp, isUser ? { color: '#f59e0b80' } : { color: '#6b7280' }]}>
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  )
}

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current]
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start()
    })
  }, [])
  return (
    <View style={[styles.bubbleRow, styles.rowLeft]}>
      <View style={styles.aiAvatar}><Ionicons name="sparkles" size={12} color={AMBER} /></View>
      <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 14, paddingHorizontal: 20 }]}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {dots.map((dot, i) => <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: dot }] }]} />)}
        </View>
      </View>
    </View>
  )
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Namaste! 👋 ShelfSense yahan hai. Apne stores ke baare mein kuch bhi poochho — stock, sales, revenue.', timestamp: new Date().toISOString() }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (isRecording) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])).start()
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  useEffect(() => {
    return () => {
      Speech.stop()
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(console.warn)
    }
  }, [])

  const sendMessage = useCallback(async (text: string, speakResponse = false) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    Speech.stop()

    try {
      const baseUrl = await getBaseUrl()
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId: 'mobile-session', mode: speakResponse ? 'voice' : 'text' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      let fullText = ''
      const aiId = Date.now().toString() + 'ai'
      setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', timestamp: new Date().toISOString() }])

      if (Platform.OS === 'web') {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            fullText += decoder.decode(value, { stream: true })
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m))
          }
        }
      } else {
        fullText = await res.text()
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m))
      }

      if (speakResponse && fullText) {
        Speech.speak(fullText, { language: 'en-IN', rate: 0.9, pitch: 1.0 })
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `⚠️ Error processing request`, timestamp: new Date().toISOString() }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const startRecording = async () => {
    try {
      Speech.stop()
      const perm = await Audio.requestPermissionsAsync()
      if (perm.status !== 'granted') return Alert.alert('Microphone Data required')
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS)
      recordingRef.current = recording
      setIsRecording(true)
    } catch (e) {
      Alert.alert('Recording Error')
    }
  }

  const stopRecording = async () => {
    if (!recordingRef.current) return
    setIsRecording(false)
    setIsTranscribing(true)
    try {
      await recordingRef.current.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      if (!uri) throw new Error('No URI')

      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
      const baseUrl = await getBaseUrl()
      const transcribeRes = await fetch(`${baseUrl}/api/voice/transcribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio, mimeType: 'audio/m4a' }),
      })
      if (!transcribeRes.ok) throw new Error('Transcription failed')

      const { text } = await transcribeRes.json()
      if (text?.trim()) {
        setInput(text)
        sendMessage(text, true)
      }
    } catch (e) {
      Alert.alert('Voice Error', 'Could not transcribe.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const scrollToBottom = () => flatListRef.current?.scrollToEnd({ animated: true })
  
  const voiceBusy = isRecording || isTranscribing

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble msg={item} />}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        onContentSizeChange={scrollToBottom}
        indicatorStyle="white"
      />

      {/* Sticky Blur Header */}
      <BlurView intensity={70} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="sparkles" size={14} color={AMBER} />
            </View>
            <View>
              <Text style={styles.headerTitle}>ShelfSense AI</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSub}>Gemini 2.0 Flash</Text>
              </View>
            </View>
          </View>
          {isTranscribing && <ActivityIndicator size="small" color={AMBER} />}
        </View>
        <FlatList
          data={CHIPS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.chipsWrap}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chip} onPress={() => sendMessage(item.query)} disabled={isLoading}>
              <Text style={styles.chipText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </BlurView>

      {/* Glassmorphic Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={isRecording ? '🎙️ Listening...' : isTranscribing ? '⏳ Deciphering...' : 'Message ShelfSense...'}
              placeholderTextColor="#6b7280"
              style={styles.input}
              multiline
              editable={!voiceBusy}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />
            
            <View style={styles.actionsBox}>
              <View style={styles.voiceWrap}>
                {isRecording && <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />}
                <TouchableOpacity
                  style={[styles.voiceBtn, voiceBusy && styles.voiceBtnActive]}
                  onPressIn={startRecording} onPressOut={stopRecording} disabled={isLoading}
                >
                  <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={20} color={voiceBusy ? '#000' : '#d1d5db'} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                <Ionicons name="arrow-up" size={18} color={(!input.trim() || isLoading) ? '#6b7280' : '#000'} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#ffffff1a',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrapper: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#f59e0b1f', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', shadowColor: '#22c55e', shadowOpacity: 0.8, shadowRadius: 4 },
  headerSub: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  chipsWrap: { gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff0a', borderWidth: 1, borderColor: '#ffffff15' },
  chipText: { fontSize: 12, color: '#e5e7eb', fontWeight: '500' },
  
  messageList: { paddingTop: 160, paddingHorizontal: 20, paddingBottom: 120, gap: 20 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  aiAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff1a' },
  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12 },
  aiBubble: { backgroundColor: '#1c1c1f', borderRadius: 20, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: '#ffffff0f' },
  userBubble: { backgroundColor: '#f59e0b', borderRadius: 20, borderBottomRightRadius: 6, shadowColor: AMBER, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  aiText: { color: '#f3f4f6' },
  userText: { color: '#000000', fontWeight: '500' },
  timestamp: { fontSize: 10, marginTop: 6, textAlign: 'right' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AMBER, opacity: 0.8 },
  
  inputContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 10 : 80, left: 16, right: 16 }, // Adjusted for floating tab bar
  inputGlass: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 28, borderWidth: 1, borderColor: '#ffffff1a', backgroundColor: '#ffffff08', paddingHorizontal: 6, paddingVertical: 6 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, color: '#f3f4f6', fontSize: 15, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  actionsBox: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4, paddingRight: 4, gap: 4 },
  voiceWrap: { position: 'relative', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#f59e0b50' },
  voiceBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  voiceBtnActive: { backgroundColor: '#f59e0b' },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: AMBER, alignItems: 'center', justifyContent: 'center', shadowColor: AMBER, shadowOpacity: 0.3, shadowRadius: 4 },
  sendBtnDisabled: { backgroundColor: '#ffffff10', shadowOpacity: 0 },
})
