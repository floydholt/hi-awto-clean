#!/usr/bin/env bash
set -e

echo "---------------------------------------------------"
echo "🔥 HIAWTO: Firebase Cleanup + Duplicate-App Fixer"
echo "---------------------------------------------------"

cd "$(dirname "$0")"

echo "📁 Working directory: $(pwd)"

# -------------------------------------------------------------------
# Remove old or conflicting Firebase config files
# -------------------------------------------------------------------
echo "🧹 Removing duplicate Firebase config files..."
rm -f src/firebaseConfig.js
rm -f src/firebaseConfigLocal.json
rm -f src/firebase.local.js
rm -f src/firebase_old.js
rm -f src/firebaseConfig.ts
rm -f src/firebase-config.js 2>/dev/null || true

# -------------------------------------------------------------------
# Generate a clean single firebase.js file
# -------------------------------------------------------------------
echo "📝 Creating src/firebase.js..."

cat > src/firebase.js << 'EOF'
// HIAWTO — Unified Firebase Initialization (Safe for CRA)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// CRA injects these from .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize once — eliminate “default app already exists”
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the main services used across the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
EOF

echo "✔ firebase.js created"

# -------------------------------------------------------------------
# Update imports in all JS/JSX files
# -------------------------------------------------------------------
echo "🔍 Updating imports across project..."

grep -Rl "firebaseConfig" src | while read -r file; do
  echo "  🔧 Fixing: $file"
  sed -i 's|../firebaseConfig|../firebase|g' "$file"
  sed -i 's|./firebaseConfig|./firebase|g' "$file"
  sed -i 's|../firebaseConfig.js|../firebase|g' "$file"
  sed -i 's|./firebaseConfig.js|./firebase|g' "$file"
done

grep -Rl "firebaseConfigLocal" src | while read -r file; do
  echo "  🔧 Fixing (Local): $file"
  sed -i 's|firebaseConfigLocal|firebase|g' "$file"
done

# Fix cases where import might be upper/lowercase mismatch
grep -Rl "from \"../Firebase\"" src | while read -r file; do
  echo "  🔧 Fixing import casing: $file"
  sed -i 's|from "../Firebase"|from "../firebase"|g' "$file"
done

# -------------------------------------------------------------------
# Validate .env variables exist
# -------------------------------------------------------------------
echo "🔍 Checking .env..."

if [ ! -f ".env" ]; then
  echo "❌ ERROR: .env file missing in client/.env"
  echo "Create it with your Firebase API keys!"
  exit 1
fi

missing=0

function check_var() {
  if ! grep -q "$1" .env; then
    echo "❌ Missing: $1"
    missing=1
  fi
}

check_var "REACT_APP_FIREBASE_API_KEY"
check_var "REACT_APP_FIREBASE_AUTH_DOMAIN"
check_var "REACT_APP_FIREBASE_PROJECT_ID"
check_var "REACT_APP_FIREBASE_STORAGE_BUCKET"
check_var "REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
check_var "REACT_APP_FIREBASE_APP_ID"

if [ $missing -eq 1 ]; then
  echo "⚠️ WARNING: Some Firebase env variables are missing."
else
  echo "✔ All required Firebase env variables are present."
fi

# -------------------------------------------------------------------
# Final CRA cache reset (Sometimes required)
# -------------------------------------------------------------------
echo "🧽 Clearing CRA/Webpack cache..."
rm -rf node_modules/.cache 2>/dev/null || true

echo "---------------------------------------------------"
echo "🎉 Firebase cleanup completed successfully!"
echo "You can now run: npm start"
echo "---------------------------------------------------"
