#!/usr/bin/env bash
set -e

# Load environment
export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/quocduong-auto/fb-sync.log"

mkdir -p "$(dirname "$LOG_FILE")"

echo "==================================================" >> "$LOG_FILE"
echo "Starting scheduled Facebook sync at $(date)" >> "$LOG_FILE"

python3 "$SCRIPT_DIR/crawl-facebook-posts.py" --env-file /etc/quocduong-auto.env --days 30 >> "$LOG_FILE" 2>&1

echo "Facebook sync finished at $(date)" >> "$LOG_FILE"
