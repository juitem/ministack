#!/bin/bash

# MiniStack 다중 프로젝트 데모 시뮬레이션
# 엔진은 한 곳에 있고, 여러 폴더에서 독립적으로 작동하는 것을 보여줍니다.

ENGINE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENGINE_SH="$ENGINE_DIR/ministack.sh"

echo "=================================================="
echo "🌟 MiniStack 다중 프로젝트 관리 데모"
echo "=================================================="

# 1. Project A 생성 및 실행
echo -e "\n[1] 프로젝트 Alpha 생성 중..."
mkdir -p demo_projects/alpha
cd demo_projects/alpha
$ENGINE_SH start feature
$ENGINE_SH status
cd ../..

# 2. Project B 생성 및 실행
echo -e "\n[2] 프로젝트 Beta 생성 중..."
mkdir -p demo_projects/beta
cd demo_projects/beta
$ENGINE_SH start fix
$ENGINE_SH status
cd ../..

echo -e "\n--------------------------------------------------"
echo "✅ 요약: 각 폴더에 독립적인 'state.json'이 생성되었습니다."
echo "Alpha 프로젝트 경로: ./demo_projects/alpha"
echo "Beta 프로젝트 경로: ./demo_projects/beta"
echo -e "\n어느 폴더에서든 '$ENGINE_SH'을 호출하면 해당 폴더의 상태를 읽습니다."
echo "=================================================="
