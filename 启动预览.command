#!/bin/zsh
cd "$(dirname "$0")"
echo '作品集预览：http://127.0.0.1:4188/'
echo '按 Control+C 停止预览。'
/usr/bin/python3 -m http.server 4188 --bind 127.0.0.1 --directory dist &
portfolio_preview_pid=$!
trap 'kill "$portfolio_preview_pid" 2>/dev/null' EXIT INT TERM
for portfolio_attempt in {1..30}; do
  if /usr/bin/curl -fsS -o /dev/null http://127.0.0.1:4188/; then
    open 'http://127.0.0.1:4188/'
    break
  fi
  sleep 0.1
done
wait "$portfolio_preview_pid"
