#!/bin/bash

# MiniStack 데모 실행 스크립트 (AI Todo App 시나리오)
# 이 스크립트는 10단계 워크플로우를 따라가며 주요 프롬프트 생성을 시연합니다.

echo "=================================================="
echo "🚀 MiniStack 데모 실행: AI Todo App 시나리오"
echo "=================================================="

echo -e "\n[1단계] 워크플로우 시작 (feature)"
./ministack.sh start feature

echo -e "\n[2단계] 1단계 프롬프트 생성 (시장 조사)"
./ministack.sh prompt "AI 기반의 할 일 자동 분류 기능이 포함된 고급 Todo 앱 기획을 도와줘"

echo -e "\n[3단계] 다음 단계로 이동 (2단계: 기술 분석)"
./ministack.sh next

echo -e "\n[4단계] 2단계 프롬프트 생성"
./ministack.sh prompt

echo -e "\n[5단계] 보안 점검 단계로 직접 이동 (9단계)"
./ministack.sh set 9

echo -e "\n[6단계] 9단계 프롬프트 생성 (보안 리뷰)"
./ministack.sh prompt "OWASP 기준에 맞춰서 이 Todo 앱의 API 보안을 점검해줘"

echo -e "\n--------------------------------------------------"
echo "✅ 데모 실행이 완료되었습니다!"
echo "현재 상태를 확인하려면 './ministack.sh status'를 호출하세요."
echo "=================================================="
