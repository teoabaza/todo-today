# TodoToday App

React Native (Expo) mobile app for staying on top of daily todos.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Update `src/config.ts` with your API URL:
   - For local testing with Expo Go on your phone (same WiFi as your computer), use your computer's LAN IP, e.g. `http://192.168.1.50:4000`.
   - For production, use your Coolify domain, e.g. `https://api.yourdomain.com`.
3. Start the dev server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with Expo Go on your phone.

> Note: the backend's `CORS_ORIGIN` should allow your dev/app origin (set to `*` for development).

## Project structure

```
App.tsx                  # Root component, navigation + auth gate
src/
  api/                    # API client, auth & todos requests
  components/             # Button, Input, TodoItem, ColorPicker, SegmentedControl
  context/AuthContext.tsx # Auth state, token persistence
  navigation/              # Auth stack + main bottom tabs
  screens/                 # Login, Register, Home, Calendar, AddTodo
  theme/theme.ts           # Colors, spacing, typography (based on logo palette)
  utils/date.ts            # Date helpers
  config.ts                # API_URL
assets/                   # App icon, splash (from your logo)
```

## Features implemented

- Register / Login with JWT, persisted via AsyncStorage
- Home screen: today's date, today's todos, tick to mark done (turns green)
- Add Todo modal: description (required), date (defaults to today, editable via date picker),
  colour (required, random default, pick from palette), urgency (low/moderate/high, low default),
  status (not started/in progress/done, default not started)
- Calendar tab: monthly view with colour dots per day (from `react-native-calendars`),
  tap a day to see/add todos for that date

## Building with EAS

1. Log in:
   ```bash
   npx eas login
   ```
2. Configure the project (creates/links an EAS project ID):
   ```bash
   npx eas build:configure
   ```
   This will update `app.json`'s `extra.eas.projectId`.
3. Build for Android (APK for quick testing on your device):
   ```bash
   npx eas build --platform android --profile preview
   ```
4. Build for iOS / production builds:
   ```bash
   npx eas build --platform ios --profile production
   npx eas build --platform android --profile production
   ```

## Testing with Expo Go

- Run `npx expo start`, scan the QR with the Expo Go app.
- Make sure `API_URL` in `src/config.ts` points to a reachable backend
  (your computer's LAN IP + port 4000 for local dev, or your deployed Coolify API URL).
