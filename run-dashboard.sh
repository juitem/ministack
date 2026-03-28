echo "🧹 기존 포트(5174, 3001)를 정리합니다..."
lsof -ti :5174,3001 | xargs kill -9 2>/dev/null || true

echo "🚀 TeamBuilder Dashboard & Persistence Server를 기동합니다..."
cd "$(dirname "$0")/TeamBuilder/dashboard" || exit

if [ ! -d "node_modules" ]; then
    echo "📦 의존성 패키지가 없어 설치를 진행합니다..."
    bun install
fi

# 1. Persistence Server 시작 (배후 실행)
bun run server.ts &
SERVER_PID=$!

# 2. Vite Dashboard 시작
bun run dev --port 5174 --host

# 스크립트 종료 시 서버도 함께 종료
trap "kill $SERVER_PID" EXIT
