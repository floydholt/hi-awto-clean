#!/usr/bin/env bash
set -e
echo "Normalizing classnames across client/src..."

ROOT="src"

# Backup
BACKUP="backups/ui-normalize-$(date +%s)"
mkdir -p "$BACKUP"
cp -r "$ROOT" "$BACKUP/"

# Replace exact className="button" -> className="btn"
grep -RIl 'className="button"' $ROOT | while read -r f; do
  sed -i 's/className="button"/className="btn"/g' "$f"
done

# Replace className="input" -> className="input-base"
grep -RIl 'className="input"' $ROOT | while read -r f; do
  sed -i 's/className="input"/className="input-base"/g' "$f"
done

# Replace className="card" -> className="card" (keeps same, but ensures exist)
# Replace className="small" -> className with muted small text
grep -RIl 'className="small"' $ROOT | while read -r f; do
  sed -i 's/className="small"/className="muted"/g' "$f"
done

# Replace inline "input" placeholders used in JSX attributes (e.g. className="input form-row")
grep -RIl 'className=".*input.*"' $ROOT | while read -r f; do
  sed -i 's/input\b/input-base/g' "$f"
done

echo "Normalization complete. Backup stored at $BACKUP"
