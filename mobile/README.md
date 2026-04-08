# ShelfSense Mobile

Companion app for ShelfSense — the retail intelligence chatbot. Built with Expo (React Native) + TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Start the Expo server
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

---

## Running on a Physical Device

When running on a real phone (not emulator), the app must talk to your laptop's local IP — not `localhost`.

**Step 1:** Find your machine's IP
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Look for something like `192.168.1.42`.

**Step 2:** In the Settings tab of the app, set the API URL to:
```
http://192.168.1.42:3000
```

Make sure the web app (`/web`) is running with `npm run dev` on your laptop.

---

## Screens

| Screen    | Description |
|-----------|-------------|
| Welcome   | Splash screen with branded CTA |
| Chat      | Full AI chat interface with voice (hold mic to record) |
| Insights  | KPI cards + 7-day revenue line chart |
| Settings  | Set custom API URL + theme toggle |

## Voice Input

The Chat screen includes a **hold-to-record** mic button. While recording, an animated amber pulse ring appears around the button. The recorded audio is captured via `expo-av`.

> Note: Full Speech-to-Text requires a cloud STT API (Google Cloud Speech, Whisper, etc.). The current demo simulates transcription for offline/demo resilience.

## Tech Stack

- Expo SDK 54  
- React Navigation (Stack + Bottom Tabs)
- `expo-av` for audio recording
- `expo-linear-gradient` for CTA button
- `react-native-chart-kit` for line charts
- `@react-native-async-storage/async-storage` for persisting API URL
