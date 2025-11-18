#!/usr/bin/env bash
set -e

echo "--------------------------------------------"
echo " 🚀 HIAWTO — FULL AUTOMATED REPO CLEANUP"
echo "--------------------------------------------"

ROOT="$(pwd)"

echo ""
echo "📁 Cleaning invalid & duplicate client folders..."
rm -rf client/backups 2>/dev/null || true
rm -rf client/ui-normalize-* 2>/dev/null || true
rm -rf client/components-cleanup 2>/dev/null || true
rm -rf client/react-backup-* 2>/dev/null || true

echo "   ✔ Removed backups and experimental UI folders"

echo ""
echo "📁 Removing node_modules (should NEVER be committed)..."
rm -rf client/node_modules 2>/dev/null || true
rm -rf functions/node_modules 2>/dev/null || true

echo "   ✔ node_modules removed"

echo ""
echo "📁 Removing build artifacts..."
rm -rf client/build 2>/dev/null || true
rm -rf client/dist 2>/dev/null || true
rm -rf dist 2>/dev/null || true

echo "   ✔ Removed build outputs"

echo ""
echo "📁 Removing empty & placeholder files..."
find client/src -type f -empty -delete

echo "   ✔ Removed empty files"

echo ""
echo "📦 Normalizing client structure..."

# ensure folders exist
mkdir -p client/src
mkdir -p client/public
mkdir -p client/src/components
mkdir -p client/src/styles

echo "   ✔ Folder structure normalized"

echo ""
echo "🧹 Cleaning duplicate component files..."

# Remove duplicate versions accidentally committed during AI generation sessions
rm -f client/src/components/*-COPY.js 2>/dev/null || true
rm -f client/src/components/*.old 2>/dev/null || true
rm -f client/src/components/*.backup 2>/dev/null || true
rm -f client/src/*-backup.* 2>/dev/null || true
rm -f client/src/*.tmp 2>/dev/null || true

echo "   ✔ Removed duplicate artifact files"

echo ""
echo "🎨 Restoring Tailwind v3 configuration..."

cat > client/tailwind.config.js <<'EOF'
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF

echo "   ✔ Tailwind config restored"

echo ""
echo "🎨 Restoring PostCSS config..."

cat > client/postcss.config.cjs <<'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

rm -f client/postcss.config.js 2>/dev/null || true

echo "   ✔ PostCSS config restored"

echo ""
echo "📄 Restoring index.css..."

cat > client/src/index.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900;
}
EOF

echo "   ✔ index.css restored"

echo ""
echo "🔑 Generating .env.example (safe to commit)..."

cat > client/.env.example <<'EOF'
# Firebase Web Config (public & safe to commit)
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY_HERE
REACT_APP_FIREBASE_AUTH_DOMAIN=hi-awto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hi-awto
REACT_APP_FIREBASE_STORAGE_BUCKET=hi-awto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
EOF

echo "   ✔ .env.example created"

echo ""
echo "🧽 Cleaning any leftover file debris..."

find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

echo "   ✔ Cleanup complete"

echo ""
echo "--------------------------------------------"
echo " 🎉 CLEANUP FINISHED!"
echo "    Your repository is now normalized."
echo "    NEXT STEP: npm install inside client/"
echo "--------------------------------------------"
