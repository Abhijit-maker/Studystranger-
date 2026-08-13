# Study Stranger

A personal AI mentor for Class 12 (WBCHSE) students, specializing in Semester 3 exam preparation. Includes a React + Vite web app and a **full native Java Android app** (Android SDK, no Capacitor/webview).

## Features

- AI mentor chat with live voice session (Gemini API)
- Syllabus-based study tools for Biology, Bengali A, and English B
- Native Android app: subject-wise MCQ mock tests with instant feedback
- Results screen with percentage score and motivational grading
- Review screen with explanations for every answer
- Flashcard-style revision cards of critical exam facts
- Full WBCHSE Semester 3 syllabus browser
- Firebase Auth + Firestore for user data sync

## Project Structure

```
.
├── src/               # React web application
├── server.ts          # Express + Vite dev server (Gemini/Deapi keys)
├── android/           # (legacy) Capacitor Android project
├── android-app/       # (legacy) native Kotlin/Compose skeleton
├── NativeAndroid/     # Full native Java Android app (primary)
├── firebase-*.json    # Firebase configuration
├── capacitor.config.ts # Capacitor config (webDir: dist)
└── .github/workflows/ # CI/CD: web build + native Java APK
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

## Native Android Build (Java)

The `NativeAndroid/` project is a full native Java app built purely with the Android SDK — no Capacitor, no webview.

```
cd NativeAndroid
./gradlew assembleDebug
```

The debug APK is output to `NativeAndroid/app/build/outputs/apk/debug/app-debug.apk` (package `com.studystranger.ai`).

## CI/CD

`.github/workflows/ci-cd.yml` runs on every push/PR to `main`:

- **web-build**: installs deps, typechecks, builds the Vite app, uploads `dist/`
- **android-build**: compiles the native Java Android APK with the Android SDK and uploads it as a build artifact
