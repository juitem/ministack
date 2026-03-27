#!/bin/bash
# MiniStack Bun(TypeScript) 전용 실행 스크립트
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bun "$DIR/ministack.ts" "$@"
