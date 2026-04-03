#!/usr/bin/env bash
# =============================================================================
# build_android_debug.sh
# Builds a debug APK for Firebase Robo Test
# =============================================================================
set -e

echo "📦 Building debug APK for Robo Test..."

# Step 1: Prebuild the android native project (Expo managed workflow)
echo "→ Running expo prebuild..."
npx expo prebuild --platform android --clean --no-install

# Step 2: Build the debug APK
echo "→ Building debug APK..."
cd android
./gradlew assembleDebug --no-daemon

# Step 3: Report output location
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "✅ Build successful!"
  echo "   APK: android/$APK_PATH"
  echo ""
  echo "📤 To run Robo Test on Firebase Test Lab:"
  echo ""
  echo "   gcloud firebase test android run \\"
  echo "     --type robo \\"
  echo "     --app android/$APK_PATH \\"
  echo "     --robo-script ../firebase/robo_script.json \\"
  echo "     --device model=Pixel6,version=33,locale=en,orientation=portrait \\"
  echo "     --timeout 300s \\"
  echo "     --results-bucket gs://YOUR_BUCKET_NAME"
else
  echo "❌ Build failed. APK not found at $APK_PATH"
  exit 1
fi
