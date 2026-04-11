# Firebase Robo Test Setup

## What is Robo Test?

Firebase Robo Test is an **automated crawler** that explores your app on real devices — no test code required. It:
- Crawls all screens automatically
- Records video of each test run
- Captures screenshots & logs
- Detects crashes and ANRs (Application Not Responding)
- Can be guided via a **Robo Script** for login flows

---

## Files in this folder

| File | Purpose |
|------|---------|
| `robo_script.json` | Guides the crawler through login (email → OTP → verify) |
| `robo_directives.yaml` | Reference for `--robo-directives` CLI flags |
| `build_android_debug.sh` | Builds the debug APK locally |

---

## Prerequisites

### 1. Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com)
- Create or select your project
- Enable **Test Lab** (Blaze plan required for physical devices)

### 2. Google Cloud SDK
```bash
# Install from: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_FIREBASE_PROJECT_ID
```

### 3. Create a GCS bucket for results
```bash
gsutil mb -l us-central1 gs://your-app-robo-results
```

---

## Running Robo Test Locally

### Android

#### Step 1: Build the APK
```bash
# Option A: Using npm script
npm run build:android:debug

# Option B: Using the shell script
bash firebase/build_android_debug.sh
```

#### Step 2: Run Robo Test
```bash
# Basic run (Robo crawls automatically)
gcloud firebase test android run \
  --type robo \
  --app android/app/build/outputs/apk/debug/app-debug.apk \
  --device model=Pixel6,version=33,locale=en,orientation=portrait \
  --timeout 300s

# With Robo Script (guides through login)
gcloud firebase test android run \
  --type robo \
  --app android/app/build/outputs/apk/debug/app-debug.apk \
  --robo-script firebase/robo_script.json \
  --robo-directives text:email-input=alex@dandan.io \
  --device model=Pixel6,version=33,locale=en,orientation=portrait \
  --device model=Pixel4a,version=30,locale=en,orientation=portrait \
  --timeout 300s \
  --results-bucket gs://your-app-robo-results

# Shortcut via npm script
npm run firebase:robo:android
```

### iOS

#### Step 1: Build IPA (requires Mac with Xcode)
```bash
npx expo prebuild --platform ios --clean --no-install
cd ios && pod install

xcodebuild build-for-testing \
  -workspace rn_reanimated.xcworkspace \
  -scheme rn_reanimated \
  -sdk iphoneos \
  -configuration Debug \
  -derivedDataPath build

cd build/Build/Products
zip -r ../../../../firebase/ios_robo.zip Debug-iphoneos/rn_reanimated.app
```

#### Step 2: Run Robo Test
```bash
gcloud firebase test ios run \
  --test firebase/ios_robo.zip \
  --device model=iphone14pro,version=16.6 \
  --timeout 300s \
  --results-bucket gs://your-app-robo-results
```

---

## CI/CD (GitHub Actions)

The workflow at `.github/workflows/firebase-robo-test.yml` runs automatically on every push to `main` or `develop`.

### Required GitHub Secrets

Go to **Settings → Secrets and Variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `GCP_SERVICE_ACCOUNT_KEY` | JSON key of a GCP service account with Firebase Test Lab Editor role |
| `FIREBASE_TEST_BUCKET` | GCS bucket name (without `gs://`), e.g. `my-app-robo-results` |
| `GRAPHQL_URL` | Your GraphQL API URL |

### Creating the GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create firebase-test-lab \
  --display-name "Firebase Test Lab CI"

# Grant required roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:firebase-test-lab@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudtestservice.testAdmin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:firebase-test-lab@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Download key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account firebase-test-lab@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copy the contents of gcp-key.json into the GCP_SERVICE_ACCOUNT_KEY GitHub secret
```

---

## Viewing Results

After a test run:
1. Open [Firebase Console → Test Lab](https://console.firebase.google.com/project/_/testlab)
2. Click on your test run to see:
   - Video recording of the crawl
   - Screenshots of each screen visited
   - Crash logs and stack traces
   - Performance metrics

Or view raw results in GCS:
```bash
gsutil ls gs://your-app-robo-results/robo-android-*/
```

---

## Device Matrix (Recommended)

| Platform | Model | API/OS | Priority |
|----------|-------|--------|----------|
| Android | Pixel 6 | API 33 (Android 13) | High |
| Android | Pixel 4a | API 30 (Android 11) | High |
| Android | Galaxy S21 | API 31 (Android 12) | Medium |
| iOS | iPhone 14 Pro | iOS 16.6 | High |
| iOS | iPhone 13 | iOS 15.5 | High |
| iOS | iPhone SE (3rd gen) | iOS 15.5 | Medium |
