#!/usr/bin/env bash
# cleanup.sh - Recursively remove all *.bak and *.tmp files from the project root.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Scanning for *.bak and *.tmp files in: $PROJECT_ROOT"

COUNT_BAK=$(find "$PROJECT_ROOT" -type f -name "*.bak" | wc -l)
COUNT_TMP=$(find "$PROJECT_ROOT" -type f -name "*.tmp" | wc -l)

echo "Found $COUNT_BAK *.bak files and $COUNT_TMP *.tmp files."

if [ "$COUNT_BAK" -gt 0 ] || [ "$COUNT_TMP" -gt 0 ]; then
  find "$PROJECT_ROOT" -type f \( -name "*.bak" -o -name "*.tmp" \) -print -delete
  echo "Cleanup complete! All *.bak and *.tmp files removed."
else
  echo "No *.bak or *.tmp files found."
fi
