# MiniStack (미니스택)

**MiniStack**은 `gstack`의 철학을 계승하여, 사용자의 워크스페이스 내에서 AI 에이전트와 체계적으로 협업할 수 있도록 설계된 **초경량 에이전트 오케스트레이션 시스템**입니다.

## 🌟 핵심 가치
- **언어 중립적**: Python과 Bun(TypeScript) 중 원하는 환경을 선택해 실행할 수 있습니다.
- **데이터 기반**: 모든 단계와 역할은 마크다운(`MD`)으로 정의되어 수정과 확장이 매우 쉽습니다.
- **연속성 보장**: `state.json`을 통해 작업이 중단되어도 언제든 현재 단계에서 재개할 수 있습니다.
- **품질 중심**: 9단계 고도화 프로세스와 피드백 루프를 통해 결과물의 높은 품질을 지향합니다.

## 🚀 시작하기 (Get Started)

MiniStack은 두 가지 실행 엔진을 제공합니다. 사용자의 환경에 맞는 엔진을 선택하세요.

### 방법 A: Python 버전
Python 3.x 환경에서 실행합니다.
```bash
python3 ministack.py start feature
python3 ministack.py status
python3 ministack.py prompt
```

### 방법 C: 통합 실행 스크립트 (추천)
모든 환경에서 가장 간편하게 실행하는 방법입니다. 자동으로 사용 가능한 엔진(Bun 또는 Python)을 선택합니다.
```bash
chmod +x ministack.sh
./ministack.sh start feature
```

### 방법 D: 언어별 전용 스크립트
특정 엔진을 명시적으로 사용하고 싶을 때 사용합니다.
```bash
# Python 전용
./ministack-py.sh status

# Bun(TS) 전용
./ministack-ts.sh status
```

> [!TIP]
> `alias ministack='/absolute/path/to/ministack.sh'`를 쉘 설정(`.zshrc` 등)에 추가하면 어디서든 `ministack` 명령어로 사용할 수 있습니다.

## 📂 디렉토리 구조
- `roles/`: 각 전문가 페르소나 정의 (`senior-engineer`, `product-manager` 등)
- `workflows/`: 구체적인 작업 절차 및 루프 정의 (`feature.md`, `fix.md`)
- `docs/`: 워크플로우 진행 중 생성되는 산출물(PRD, 설계서 등) 저장소
- `ministack.py` / `ministack.ts`: 상태 관리 및 프롬프트 생성 엔진
- `state.json`: 현재 프로젝트의 진행 상태 (자동 생성)

## 🛠 주요 명령어
- `list`: 사용 가능한 역할과 워크플로우 목록 확인
- `start <workflow>`: 새로운 워크플로우 시작 (단계 초기화)
- `status`: 현재 진행 중인 단계 및 워크플로우 확인
- `steps`: 현재 워크플로우의 모든 단계 목록과 목표 확인
- `next`: 다음 단계로 이동
- `back`: 이전 단계로 이동 (루프 회귀 시 사용)
- `set <number>`: 특정 단계로 직접 이동
    * 예: `python3 ministack.py set 5`
- `prompt [message]`: 현재 단계에 최적화된 프롬프트 생성. 뒤에 지시 사항을 추가하면 AI에게 함께 전달됩니다.
    * 예: `python3 ministack.py prompt "코드 보안을 집중적으로 봐줘"`

## 🎨 커스터마이징
- **역할 추가**: `roles/` 폴더에 새로운 `.md` 파일을 만들고 페르소나를 정의하세요.
- **절차 수정**: `workflows/` 폴더의 파일을 수정하여 팀만의 고유한 개발 문화를 만드세요.
- **도구 정의**: 각 역할 파일의 `## 도구` 섹션에 사용 가능한 도구를 명시하면 AI가 이를 인지합니다.

---
MiniStack은 가볍지만 강력하게 당신의 개발 여정을 가이드합니다.
