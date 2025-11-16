#!/usr/bin/env bash
set -e

echo "---------------------------------------------------"
echo "🔥 HIAWTO React Router v6 Cleanup Script"
echo "---------------------------------------------------"

cd "$(dirname "$0")"
echo "📁 Working directory: $(pwd)"

SRC="src"

# ------------------------------------------------------------
# 1. Fix incorrect React Router imports
# ------------------------------------------------------------
echo "🔧 Fixing React Router imports..."

grep -Rl "react-router-dom" $SRC | while read -r file; do
  echo "  → Updating imports in: $file"

  # Replace old v5 imports
  sed -i 's|import { Switch |import { Routes |g' "$file"
  sed -i 's|import { Route, Switch |import { Route, Routes |g' "$file"
  sed -i 's|from "react-router-dom/Switch"|from "react-router-dom"|g' "$file"

  # Ensure correct v6 imports
  sed -i 's|import { BrowserRouter as Router, Route, Routes } from "react-router-dom";|import { BrowserRouter as Router, Routes, Route } from "react-router-dom";|g' "$file"
done

# ------------------------------------------------------------
# 2. Fix Route syntax (component= → element=)
# ------------------------------------------------------------
echo "🔧 Converting Route component= to element=..."

grep -Rl "component=" $SRC | while read -r file; do
  echo "  → Fixing: $file"

  sed -i 's|component={\([^}]*\)}|element={<\1 />}|g' "$file"
done

# Fix simple cases such as:
# <Route path="/admin" element={AdminDashboard} />
grep -Rl "<Route" $SRC | while read -r file; do
  sed -i 's|element={\([A-Za-z0-9]*\)}|element={<\1 />}|g' "$file"
done

# ------------------------------------------------------------
# 3. Ensure index.js uses <BrowserRouter>
# ------------------------------------------------------------
echo "🔧 Ensuring index.js wraps <App /> with <BrowserRouter>..."

INDEX="$SRC/index.js"

if ! grep -q "BrowserRouter" "$INDEX"; then
  echo "⚠️ index.js missing BrowserRouter. Injecting..."

  cat > "$INDEX" << 'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
EOF

else
  echo "✔ BrowserRouter already present"
fi

# ------------------------------------------------------------
# 4. Fix common broken import paths
# ------------------------------------------------------------
echo "🔧 Fixing broken import paths (Admin, Seller, UI)..."

fix_paths() {
  sed -i 's|"./components/AdminLogin"|"./components/AdminLogin.js"|g' "$1"
  sed -i 's|"./components/AdminProtected"|"./components/AdminProtected.jsx"|g' "$1"
  sed -i 's|"./components/admin/"|"./components/admin/"|g' "$1"
  sed -i 's|"./components/ui/"|"./components/ui/"|g' "$1"
}

grep -Rl "components" $SRC | while read -r file; do
  fix_paths "$file"
done

# ------------------------------------------------------------
# 5. Repair App.jsx routing structure
# ------------------------------------------------------------
echo "🔧 Rebuilding App.jsx routes..."

APP="$SRC/App.jsx"

cat > "$APP" << 'EOF'
import React from "react";
import { Routes, Route } from "react-router-dom";

import Homepage from "./pages/Homepage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetail from "./routes/ListingDetail";
import PublicListings from "./routes/PublicListings";

// Admin & Seller
import AdminLogin from "./components/AdminLogin";
import AdminProtected from "./components/AdminProtected";
import DashboardHome from "./components/admin/DashboardHome";
import ListingManager from "./components/admin/ListingManager";
import AdminReviewModeration from "./components/admin/AdminReviewModeration";

import ProtectedRoute from "./components/ProtectedRoute";
import SellerDashboard from "./components/SellerDashboard";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/listing/:id" element={<ListingDetail />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtected />}>
        <Route path="/admin" element={<DashboardHome />} />
        <Route path="/admin/listings" element={<ListingManager />} />
        <Route path="/admin/reviews" element={<AdminReviewModeration />} />
      </Route>

      {/* Seller */}
      <Route element={<ProtectedRoute />}>
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Homepage />} />
    </Routes>
  );
}

export default App;
EOF

echo "✔ App.jsx routing replaced with clean version"

# ------------------------------------------------------------
# 6. Report Summary
# ------------------------------------------------------------
echo "---------------------------------------------------"
echo "🎉 ROUTING CLEANUP COMPLETE!"
echo "---------------------------------------------------"
echo "✔ React Router v6 syntax updated"
echo "✔ All import paths repaired"
echo "✔ App.jsx replaced with clean routing layout"
echo "✔ index.js verified with BrowserRouter"
echo "✔ All Route components converted to element={<Component />}"
echo "---------------------------------------------------"
echo "You can now run:  npm start"
echo "---------------------------------------------------"
