#!/bin/bash
set -e
cd /home/althaf/project/cedric/program/africhina-web

FRESH="frontend/dist/assets"
STALE="backend/public/assets"

echo "Backend total: $(ls "$STALE" | wc -l)"
echo "Fresh  total: $(ls "$FRESH" | wc -l)"

# Compute truly-stale = in backend but NOT in fresh
comm -23 <(ls "$STALE" | sort) <(ls "$FRESH" | sort) > /tmp/truly-stale.txt
echo "Truly stale count: $(wc -l < /tmp/truly-stale.txt)"
cat /tmp/truly-stale.txt

echo "--- index.php check ---"
ls -la backend/public/index.php 2>/dev/null || echo "MISSING"