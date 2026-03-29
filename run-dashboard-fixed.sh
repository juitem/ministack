#!/bin/bash

# 1. 기존 프로세스 확실히 정리
echo "🧹 기존 포트(5174, 3001) 및 관련 프로세스를 정리합니다..."
pkill -f "bun server.ts" || true
lsof -ti :5174,3001 | xargs kill -9 2>/dev/null || true
sleep 1

# 2. 경로 설정 및 이동
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DASH_DIR="$SCRIPT_DIR/TeamBuilder/dashboard"

if [ ! -d "$DASH_DIR" ]; then
    echo "❌ 대시보드 디렉토리를 찾을 수 없습니다: $DASH_DIR"
    exit 1
fi

cd "$DASH_DIR" || exit

# 3. 의존성 체크
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 패키지가 없어 설치를 진행합니다..."
    bun install
fi

# 4. 백엔드 서버(Persistence Server) 시작
echo "📡 Backend Server (Port: 3001) 기동 중..."
# 'bun run server.ts' 대신 'bun server.ts' 직접 실행 (더 확실함)
nohup bun server.ts > nohup.out 2>&1 &
SERVER_PID=$!
sleep 2

# 서버가 정상적으로 떴는지 확인
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Backend Server가 정상적으로 시작되었습니다. (PID: $SERVER_PID)"
else
    echo "❌ Backend Server 기동 실패! nohup.out을 확인하세요."
    exit 1
fi

# 5. 프론트엔드(Vite Dashboard) 시작
echo "🎨 Frontend Dashboard (Port: 5174) 기동 중..."
echo "-------------------------------------------------------"
echo "💡 브라우저에서 아래 주소로 접속하세요:"
echo "👉 http://localhost:5174"
echo "-------------------------------------------------------"

# Vite 실행 (--port 5174 강제 지정)
bun run dev --port 5174

# 스크립트 종료 시 서버도 함께 종료 (Ctrl+C 입력 시)
trap "kill $SERVER_PID" EXIT
