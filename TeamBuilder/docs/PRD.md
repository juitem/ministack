# 제품 요구사항 명세서 (PRD): TeamBuilder (v0.1)

## 1. 제품 개요
**TeamBuilder**는 MiniStack 엔진을 기반으로 하여, 사용자가 복잡한 AI 에이전트 팀을 시각적으로 구성하고 관리할 수 있도록 돕는 "AI 에이전트 오케스트레이션 대시보드"입니다.

## 2. 핵심 가치 (Value Proposition)
- **온디맨드 채용(Recruit)**: 프로젝트 성격에 맞는 전문가를 인력 시장(Global Pool)에서 즉시 영입.
- **전문가 등록(Onboard)**: 새로운 분야의 전문가 페르소나를 전역 인력 시장에 등록하여 자산화.
- **전문성 최적화**: 영입된 전문가에게 프로젝트 특유의 도메인 지식을 주입하여 커스터마이징.

## 3. 주요 기능 요구사항

### 3.1. 인력 시장 및 채용 (Market & Recruit)
- **Market Browser**: 전역(`GLOBAL_DIR/roles/`)에 정의된 모든 전문가 후보 살펴보기.
- **Recruit Command**: 특정 전문가를 현재 프로젝트(`LOCAL_DIR/roles/`)로 영입(복사).
- **Customize Role**: 영입된 전문가의 도구(Tools)나 지침을 프로젝트 상황에 맞게 즉석에서 수정.

### 3.2. 워크플로우 매니저 (Workflow Manager)
- `workflows/*.md`를 기반으로 전체 단계를 트리(Tree) 또는 타임라인 형태로 표시.
- 현재 단계(Current Step) 표시 및 `Next`, `Back`, `Set` 명령을 버튼 인터페이스로 제공.

### 3.3. 산출물 뷰어 (Artifact Viewer)
- `docs/` 폴더에 생성된 마크다운 결과물을 실시간으로 렌더링하여 확인.
- 단계별 산출물의 이력을 추적하고 관리.

### 3.5. 도메인 특화 팀 합성 (Domain-Specific Team Synthesis)
- 사용자의 목적에 따라 관련 도메인 지식을 페르소나에 자동으로 주입.
- **예시 시나리오 1 (Web UX)**: React/Next.js 전문가, 접근성(A11y) 전문가, 테일윈드 스타일리스트로 구성된 팀.
- **예시 시나리오 2 (Kernel SW)**: C/어셈블리 장인, 동시성 제어 전문가, 드라이버 설계 아키텍트로 구성된 팀.
- **예시 시나리오 3 (Toolchain)**: GCC/LLVM 아키텍처 전문가, 최적화 패스(Optimization Pass) 리뷰어, 명령어 셋(ISA) 분석가로 구성된 팀.

### 3.6. 지동 입력(Input) 생성기
- 선택된 팀에 최적화된 초기 "컨텍스트"와 "입력(Message)"을 자동으로 제안.
- **Frontend**: Vite + React (또는 Bun 기반의 경량 UI)
- **Backend/CLI**: 기존 MiniStack Engine (Python/TS) 활용
- **Communication**: Local API 또는 WebSocket을 통한 엔진-UI 연동

## 5. 성공 지표
- 사용자가 프로젝트 시작부터 배포까지 걸리는 시간 단축.
- 수동으로 작성하는 프롬프트의 양 감소 (자동 생성 및 템플릿화).
