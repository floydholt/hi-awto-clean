#!/usr/bin/env bash

echo "====================================="
echo "      HIAWTO REPO SCAN SCRIPT"
echo "====================================="

# Create output directory
REPORT_DIR="repo-scan-report"
mkdir -p "$REPORT_DIR"

###############################################
# 1. Generate full file list
###############################################
echo "✔ Generating full-file-list.txt..."
find . -type f | sort > "$REPORT_DIR/full-file-list.txt"

###############################################
# 2. Generate folder tree
###############################################
if command -v tree >/dev/null 2>&1; then
    echo "✔ Generating repo-tree.txt..."
    tree -a > "$REPORT_DIR/repo-tree.txt"
else
    echo "⚠ tree command not found — installing might help"
    echo "Using fallback method..."
    find . | sed -e 's/[^-][^\/]*\//  |/g' -e 's/|\([^ ]\)/|-\1/' > "$REPORT_DIR/repo-tree.txt"
fi

###############################################
# 3. Detect duplicate filenames
###############################################
echo "✔ Scanning for duplicate filenames..."
find . -type f -printf "%f\n" | sort | uniq -d > "$REPORT_DIR/duplicate-files.txt"

###############################################
# 4. Detect empty files
###############################################
echo "✔ Checking for empty files..."
find . -type f -empty > "$REPORT_DIR/empty-files.txt"

###############################################
# 5. Check for missing core project folders
###############################################
echo "✔ Checking for missing key folders..."
{
    [ -d "client/src/components" ] || echo "Missing: client/src/components"
    [ -d "client/src/pages" ] || echo "Missing: client/src/pages"
    [ -d "client/src/routes" ] || echo "Missing: client/src/routes"
    [ -d "client/src/utils" ] || echo "Missing: client/src/utils"
    [ -d "functions" ] || echo "Missing: functions/"
    [ -d "public" ] || echo "Missing: public/"
} > "$REPORT_DIR/missing-folders.txt"

###############################################
# 6. Tailwind + PostCSS sanity check
###############################################
echo "✔ Checking Tailwind/PostCSS config..."
{
    if [ ! -f "client/tailwind.config.js" ]; then
        echo "Missing: client/tailwind.config.js"
    fi
    if [ ! -f "client/postcss.config.cjs" ]; then
        echo "Missing: client/postcss.config.cjs"
    fi
    if ! grep -Rni "tailwindcss" client/postcss.config.cjs >/dev/null 2>&1; then
        echo "Tailwind plugin not detected in postcss.config.cjs"
    fi
} > "$REPORT_DIR/tailwind-check.txt"

###############################################
# 7. Firebase config audit (no secrets pulled)
###############################################
echo "✔ Checking Firebase config..."
{
    if [ -f "client/src/firebase.js" ]; then
        grep -n "initializeApp" client/src/firebase.js
    fi
    if [ -f "functions/index.js" ]; then
        grep -n "admin.initializeApp" functions/index.js
    fi
} > "$REPORT_DIR/firebase-check.txt"

###############################################
# 8. Summary
###############################################
echo "====================================="
echo "✔ Repo scan completed."
echo "Report available in: $REPORT_DIR/"
echo "Files included:"
ls -1 "$REPORT_DIR"
echo "====================================="
