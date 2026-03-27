#!/bin/bash
# MiniStack Python 전용 실행 스크립트
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
python3 "$DIR/ministack.py" "$@"
