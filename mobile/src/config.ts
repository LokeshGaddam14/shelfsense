// Central config — update BASE_URL to your machine's local IP
// when testing on a physical device (e.g. http://192.168.1.42:3000)
import AsyncStorage from '@react-native-async-storage/async-storage'

export const DEFAULT_BASE_URL = 'http://192.168.1.67:3000'

export async function getBaseUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem('BASE_URL')
    return saved ?? DEFAULT_BASE_URL
  } catch {
    return DEFAULT_BASE_URL
  }
}

export async function setBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem('BASE_URL', url)
}
