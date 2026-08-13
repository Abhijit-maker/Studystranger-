# Study Stranger

A personal AI mentor for Class 12 (WBCHSE) students, specializing in Semester 3 exam preparation. Built as a full native application: React + Vite web app wrapped with Capacitor for Android, plus a native Kotlin/Compose Android app.

## Features

- AI mentor chat with live voice session (Gemini API)
- Syllabus-based study tools for Biology, Bengali A, and English B
- Mock tests, revision cards, speed blitz, and mistake bank
- Mind maps, topic explorer, and performance insights
- Smart scanner, doubt solver, math solver, and AI memory vault
- Native Android integration: toast, device stats, haptics via Capacitor plugin
- Firebase Auth + Firestore for user data sync

## Project Structure

```
.
├── src/               # React web application
├── server.ts          # Express + Vite dev server (Gemini/Deapi keys)
├── android/           # Capacitor native Android project
├── android-app/       # Standalone native Kotlin/Compose Android app
├── firebase-*.json    # Firebase configuration
├── capacitor.config.ts # Capacitor config (webDir: dist)
└── .github/workflows/ # CI/CD: web build + native Android APK
```

## Run Locally

**Prerequisites:** Node.js 22+

1. Install dependencies:
   ```
   npm install
   ```
2. Set your API keys in `.env` (see `.env.example`):
   - `GEMINI_API_KEY` (required for live voice session)
   - `DEAPI_API_KEY` (required for AI image generation)
3. Run the app:
   ```
   npm run dev
   ```

## Web Build

```
npm run build
npm run preview
```

## Native Android Build

The web app is wrapped as a native Android application with Capacitor.

```
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is output to `android/app/build/outputs/apk/debug/app-debug.apk`.

A standalone native Kotlin/Compose app lives in `android-app/` and builds with its own Gradle setup.

## CI/CD

`.github/workflows/ci-cd.yml` runs on every push/PR to `main`:

- **web-build**: installs deps, typechecks, builds the Vite app, uploads `dist/`
- **android-build**: rebuilds web assets, syncs Capacitor, compiles the native Android APK, and uploads it as a build artifact
