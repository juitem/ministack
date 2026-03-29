# Plan: Dashboard Upgrade (Scenario & Persona-Based Team Building)

## 1. 개요 (Overview)
본 계획은 TeamBuilder 대시보드에 **'시나리오 블루프린트'** 기능과 **'페르소나 기반 인재 시장'** 기능을 추가하여, 사용자가 프로젝트 성격에 맞는 팀을 손쉽게 구성하고 가동할 수 있도록 하는 것을 목표로 함.

## 2. 주요 개발 단계 (Phases)

### Phase 1: Backend API 고도화 (server.ts)
- [ ] **Scenario 스캔 API**: `TeamBuilder/docs/scenarios/*.md` 파일 목록 및 메타데이터 반환.
- [ ] **Role 파싱 API**: `roles/**/*.md` 파일을 스캔하여 YAML 헤더(성향, 스킬 슬롯 등)를 포함한 JSON 데이터 반환.
- [ ] **Project State 업데이트**: 선택된 시나리오를 현재 프로젝트 상태(`state_project.json`)에 반영하는 로직 구현.

### Phase 2: Frontend UI 개선 (React)
- [ ] **Mission Editor**: '시나리오 불러오기' 모달 추가 및 시나리오별 미션/워크플로우 미리보기 지원.
- [ ] **Talent Market**: 인재 카드에 '핵심 철학(Identity)' 및 '성향(Style)' 태그 시각화.
- [ ] **Workflow Canvas**: 시나리오에서 로드된 워크플로우 템플릿의 시각적 렌더링 최적화.

### Phase 3: 상태 관리 및 연동 (State Management)
- [ ] **Store 연동**: 프론트엔드 `store.ts`에 시나리오 및 확장된 Role 데이터 상태 추가.
- [ ] **Persistence**: 브라우저 새로고침 시에도 선택된 시나리오와 팀 구성이 유지되도록 처리.

## 3. 기술적 핵심 포인트
- **YAML Frontmatter Parsing**: Markdown 파일 상단의 YAML 데이터를 정확하게 추출하여 필터링에 활용.
- **Scenario to Workflow Mapping**: 시나리오 문서 내의 `Workflow Phase`를 실제 가동 가능한 데이터 구조로 변환.
- **Artisanal UI 유지**: `theme_mono` 브랜치에서 구축된 미니멀한 감성을 유지하며 기능 추가.
