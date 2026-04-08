# How to Setup

This project consists of a Next.js web application and an Expo React Native mobile application. Both are needed for the full experience.

## Web Application Setup

1. Open your terminal and navigate to the `web` directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   - Make sure you have the corresponding `.env` or `.env.local` file with the required environment variables (like Database URL and any AI/API keys).

4. Database Setup (Prisma):
   ```bash
   npx prisma generate
   npx prisma db push
   # If there is a seed script:
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   The web application will be available at `http://localhost:3000`.

## Mobile Application Setup

1. Open a new terminal window and navigate to the `mobile` directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Running on a device/emulator:
   - Press `i` to open in an iOS simulator (requires Xcode).
   - Press `a` to open in an Android emulator (requires Android Studio).
   - Alternatively, scan the QR code using the Expo Go app on your physical device. Make sure your device and development machine are on the same network.
