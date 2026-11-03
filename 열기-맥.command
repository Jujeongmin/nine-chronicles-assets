#!/bin/sh
# 라이브러리를 브라우저로 연다. 쓰는 동안 이 터미널 창을 닫지 말 것.
# file:// 로 열면 브라우저가 데이터 불러오기를 막아서 로컬 서버가 필요하다.
cd "$(dirname "$0")" || exit 1
PORT=8765
while lsof -i :"$PORT" >/dev/null 2>&1; do PORT=$((PORT + 1)); done
echo ""
echo "  라이브러리 실행 중: http://localhost:$PORT/"
echo "  쓰는 동안 이 창을 닫지 마세요."
echo ""
(sleep 1; open "http://localhost:$PORT/") &
exec python3 -m http.server "$PORT" --bind 127.0.0.1
