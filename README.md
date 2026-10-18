# Neon Dash — 3D Running Adventure

A mobile-first 3D endless runner made with React, Three.js, React Three Fiber, and Capacitor. Dash through an original neon city as an original runner, switch across three lanes, jump barriers, slide under signs, collect coins, and chase a score while the speed rises. The character, city, track, coins, and obstacles are procedural Three.js geometry; no third-party game characters or assets are used.

## Play in a browser

Requirements: Node.js 20+ and npm.

```sh
npm install
npm run dev
```

Use arrow keys on a keyboard or swipe on a phone. While running, on-screen buttons also provide lane, jump, and slide controls.

## Test and build the web app

```sh
npm test
npm run build
```

## Android APK

Install Android Studio, an Android SDK platform/build tools version supported by the installed Gradle plugin, and a compatible JDK. Configure `ANDROID_HOME` or `ANDROID_SDK_ROOT` so Capacitor can locate the SDK.

```sh
npm install
npm run build
npm run android:add
npm run android:sync
npm run android:open
```

Wait for Gradle sync in Android Studio, select an Android device/emulator, then choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**. On Windows, a debug APK can also be built from PowerShell:

```powershell
.\android\gradlew.bat -p android assembleDebug
```

The debug APK output is `android\app\build\outputs\apk\debug\app-debug.apk`. Configure a signing key in Android Studio before making a distributable release. The generated `android` project is git-ignored; run `npm run android:sync` after web changes.

## Mobile performance

The renderer caps device pixel ratio at 1.4 and disables antialiasing. The scene uses low-poly primitive meshes and fog instead of downloaded textures, and the HUD respects device safe areas. Touch gestures use pointer-independent native touch events and CSS disables browser swipe/selection interference during play.