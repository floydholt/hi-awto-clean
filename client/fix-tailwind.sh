#!/usr/bin/env bash
set -e

echo "---------------------------------------------"
echo "🚀 HIAWTO: Tailwind v3 Cleanup + Auto-Fix"
echo "---------------------------------------------"

# Ensure we are inside /client
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: Run this script from inside the client/ folder."
  exit 1
fi

echo "📦 Removing Tailwind v4 + old PostCSS plugins..."
npm uninstall tailwindcss postcss autoprefixer @tailwindcss/postcss || true

echo "📥 Installing Tailwind v3..."
npm install -D tailwindcss@3 postcss@8 autoprefixer

echo "🧹 Cleaning old config files..."
rm -f tailwind.config.js
rm -f postcss.config.cjs
rm -f postcss.config.js

echo "📝 Creating fresh Tailwind v3 config..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF

echo "📝 Creating PostCSS v3-compatible config..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

echo "🎨 Rebuilding src/index.css..."
mkdir -p src
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global overrides */
body {
  @apply bg-gray-50 text-gray-900;
}

/* Reusable UI classes */
.card {
  @apply bg-white rounded-xl shadow p-6;
}

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 
         focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.button {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg 
         hover:bg-blue-700 transition;
}

.small {
  @apply text-sm text-gray-600;
}
EOF

echo "🧽 Clearing CRA cache..."
rm -rf node_modules/.cache || true

echo "📁 Ensuring node_modules exists..."
npm install --legacy-peer-deps

echo "---------------------------------------------"
echo "🎉 Tailwind v3 migration completed successfully!"
echo "You can now run: npm start"
echo "---------------------------------------------"
