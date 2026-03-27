#!/bin/bash

# MiniStack 실행 래퍼 (Execution Wrapper)
# 이 스크립트는 Bun이 설치되어 있으면 Bun 버전을, 그렇지 않으면 Python 버전을 실행합니다.

# 현재 스크립트가 위치한 디렉토리로 이동
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if command -v bun &> /dev/null; then
    # Bun이 설치된 경우
    bun "$DIR/ministack.ts" "$@"
else
    # Python으로 실행
    python3 "$DIR/ministack.py" "$@"
fi
