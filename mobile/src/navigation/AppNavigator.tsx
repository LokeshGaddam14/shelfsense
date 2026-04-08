import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { View, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import ChatScreen from '../screens/ChatScreen'
import InsightsScreen from '../screens/InsightsScreen'
import SettingsScreen from '../screens/SettingsScreen'

const Tab = createBottomTabNavigator()

const AMBER = '#f59e0b'
const BG = '#050505'
const INACTIVE = '#6b7280'

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 20,
          right: 20,
          height: 64,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          borderRadius: 32,
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
        tabBarBackground: () => (
          <View style={styles.blurContainer}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          </View>
        ),
        tabBarActiveTintColor: AMBER,
        tabBarInactiveTintColor: INACTIVE,
        tabBarShowLabel: false, // Cleaner look
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'chatbubble'
          if (route.name === 'Chat') iconName = focused ? 'chatbubble' : 'chatbubble-outline'
          if (route.name === 'Insights') iconName = focused ? 'bar-chart' : 'bar-chart-outline'
          if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline'
          
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName} size={22} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          )
        },
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#1f1f2240', // Deep transparency
    borderWidth: 1,
    borderColor: '#ffffff1a',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AMBER,
    position: 'absolute',
    bottom: -8,
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  }
})
