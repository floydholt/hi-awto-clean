#!/usr/bin/env bash
set -e

echo "---------------------------------------------------"
echo "🔥 HIAWTO Component Cleanup Script"
echo "---------------------------------------------------"

BASE="$(pwd)"
COMPONENTS="$BASE/src/components"
ADMIN="$BASE/src/components/admin"
UI="$BASE/src/components/ui"
BACKUP="$BASE/backups/components-cleanup"

mkdir -p "$BACKUP"

echo "📁 Backup folder: $BACKUP"
echo ""

# ------------------------------------------------------------
# 1. BACKUP ALL COMPONENT FILES
# ------------------------------------------------------------
echo "🗂 Backing up all component files..."
cp -r "$COMPONENTS" "$BACKUP/components"
cp -r "$ADMIN" "$BACKUP/admin"
cp -r "$UI" "$BACKUP/ui"

echo "✔ Backup complete"
echo ""

# ------------------------------------------------------------
# 2. FIX MISSING REACT IMPORTS
# ------------------------------------------------------------
echo "🔧 Fixing missing React imports..."

find "$COMPONENTS" "$ADMIN" "$UI" -type f \( -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    if ! grep -q "import React" "$file"; then
        echo "  → Adding React import to $file"
        sed -i '1s;^;import React from "react";\n;' "$file"
    fi
done

echo "✔ React imports fixed"
echo ""

# ------------------------------------------------------------
# 3. FIX MISSING EXPORT DEFAULT
# ------------------------------------------------------------
echo "🔧 Ensuring all components export default..."

find "$COMPONENTS" "$ADMIN" "$UI" -type f \( -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    if ! grep -q "export default" "$file"; then
        basename=$(basename "$file" .jsx | sed 's/.js//')
        echo "  → Adding export default to $file"

        echo -e "\nexport default $basename;" >> "$file"
    fi
done

echo "✔ Component exports fixed"
echo ""

# ------------------------------------------------------------
# 4. FIX BROKEN IMPORT PATHS
# ------------------------------------------------------------
echo "🔧 Fixing broken import paths..."

find "$COMPONENTS" "$ADMIN" "$UI" -type f -name "*.jsx" | while read -r file; do
    sed -i 's|"../components/AdminLogin"|"../AdminLogin"|g' "$file"
    sed -i 's|"../components/admin/"|"../admin/"|g' "$file"
    sed -i 's|"./AdminDashboard"|"./DashboardHome"|g' "$file"
done

echo "✔ Import paths normalized"
echo ""

# ------------------------------------------------------------
# 5. FIX PROTECTED ROUTE & ADMINPROTECTED
# ------------------------------------------------------------
PR="$COMPONENTS/ProtectedRoute.jsx"
AP="$COMPONENTS/AdminProtected.jsx"

echo "🔧 Fixing ProtectedRoute.jsx..."
cat > "$PR" << 'EOF'
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/admin/login" />;
}
EOF

echo "🔧 Fixing AdminProtected.jsx..."
cat > "$AP" << 'EOF'
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AdminProtected() {
  const { user, role } = useAuth();
  return user && role === "admin" ? <Outlet /> : <Navigate to="/admin/login" />;
}
EOF

echo "✔ Protected routes updated"
echo ""

# ------------------------------------------------------------
# 6. REMOVE DEPRECATED CUSTOM CLASSES
# ------------------------------------------------------------

echo "🔧 Cleaning deprecated custom CSS classes..."

find "$COMPONENTS" "$ADMIN" "$UI" -type f -name "*.jsx" | while read -r file; do
    sed -i 's/className="card"/className="bg-white p-4 rounded shadow"/g' "$file"
    sed -i 's/className="input"/className="border p-2 rounded w-full"/g' "$file"
    sed -i 's/className="button"/className="bg-blue-600 text-white px-4 py-2 rounded"/g' "$file"
    sed -i 's/className="small"/className="text-sm text-gray-500"/g' "$file"
done

echo "✔ Deprecated CSS replaced with Tailwind"
echo ""

# ------------------------------------------------------------
# 7. DETECT COMPLETELY BROKEN COMPONENTS
# ------------------------------------------------------------

echo "🔍 Scanning for empty or invalid components..."

find "$COMPONENTS" "$ADMIN" "$UI" -type f -name "*.jsx" | while read -r file; do
    if ! grep -q "function" "$file"; then
        echo "⚠️ POSSIBLE BROKEN COMPONENT: $file"
    fi
done

echo ""
echo "---------------------------------------------------"
echo "🎉 COMPONENT CLEANUP COMPLETE!"
echo "---------------------------------------------------"
echo "✔ All components backed up safely"
echo "✔ Missing imports fixed"
echo "✔ Missing exports fixed"
echo "✔ Deprecated classes upgraded to Tailwind"
echo "✔ Protected routes repaired"
echo "✔ Import paths normalized"
echo "---------------------------------------------------"
echo "You can now run: npm start"
echo "---------------------------------------------------"
