# 제품 요구사항 명세서 (PRD): TeamBuilder AI Orchestrator

## 1. 제품 비전 (Vision)
**TeamBuilder**는 AI 에이전트를 단순한 도구가 아닌, 프로젝트별로 '고용'하고 '교육'하며 '배치'하는 **지능형 인력 시장(Talent Market)**으로 취급하는 오케스트레이션 시스템입니다. 사용자는 도메인별 전문가 팀을 동적으로 구성하여 복잡한 과업을 수행합니다.

## 2. 핵심 엔티티 정의 (Core Entities)

### 2.1. 인력 시장 (Talent Market)
- **Global Pool**: `ministack` 설치 경로에 위치한 전역 전문가 라이브러리.
- **Hierarchical Roles**: `category/specialty.md` 구조로 체계화된 전문가 군단 (예: `engineer/kernel`, `reviewer/security`).

### 2.2. 프로젝트 팀 (Project Team - Staff)
- **Local Pool**: 현재 진행 중인 프로젝트 폴더(`${CWD}/roles/`)에 소속된 상주 인력.
- **Recruited Staff**: 글로벌 시장에서 영입된 전문가.
- **Cloned & Evolved**: 기존 인력을 복제(`clone`)하거나 교육(`train`)하여 만들어낸 파생형 전문가.

### 2.3. 역할(Role) vs 과업(Job)
- **Role (Who)**: 전문가의 정체성, 도구, 기본 지침 (Persistent Identity).
- **Job (What)**: 워크플로우의 특정 단계에서 수행해야 할 구체적인 미션과 산출물 정의 (Transient Assignment).
- **Assignment**: 특정 Job에 가장 적합한 Role을 동적으로 매핑하는 메커니즘.

## 3. 핵심 기능 요구사항 (Functional Requirements)

### 3.1. 팀 포메이션 (Formation)
- **`market`**: 현재 채용 가능한 글로벌 인력 라인업 조회.
- **`onboard <name>`**: 새로운 분야의 전문가 페르소나를 글로벌 시장에 정식 등록.
- **`recruit <name>`**: 글로벌 전문가를 내 프로젝트의 전담 팀원으로 영입.

### 3.2. 페르소나 진화 (Evolution)
- **`clone <src> <dest>`**: 특정 전문가의 능력을 그대로 복제하여 새로운 파생 전문가 생성.
- **`train <name> <knowledge>`**: 프로젝트를 통해 얻은 경험이나 추가 지식을 전문가의 페르소나 파일에 주입.

### 3.3. 과업 실행 (Execution)
- **`start <workflow>`**: 정의된 시나리오에 따라 프로젝트의 전체 여정 개시.
- **`assign <step> <role>`**: 특정 단계(Job)에 투입할 전문가(Role)를 명시적으로 지정 (예정).
- **`prompt`**: [Role의 전문성] + [Job의 구체적 상황]을 결합하여 최적의 AI 지시서 자동 생성.

### 3.4. 상태 관리 및 산출물 (State & Artifacts)
- **CWD 인식**: 모든 명령어는 현재 폴더의 `state.json`과 `docs/`를 참조하여 프로젝트 독립성 유지.
- **산출물 이력**: 각 Job의 결과물은 `docs/`에 마크다운 형태로 누적 관리.

## 4. 기술 사양 (Technical Specifications)
- **엔진**: Python (`ministack.py`) 및 TypeScript (`ministack.ts`)의 기능적 패리티 유지.
- **데이터 저장**: 데이터베이스 없이 파일 시스템(Markdown, JSON) 기반의 정적 저장 방식 채택.
- **통합**: `ministack.sh` 래퍼를 통한 원활한 명령어 호출.

## 5. 단계별 로드맵 (Roadmap)
- **Phase 1 (CLI Foundation)**: [완료] 전역/지역 리소스 관리, Recruit, Clone, Train 엔진 구현.
- **Phase 2 (Dynamic Assignment)**: [진행 예정] 특정 단계에 원하는 Role을 자유롭게 배치하는 `assign` 로직 강화.
- **Phase 3 (Web Dashboard)**: [계획] 전문가 배치 및 업무 진행 상황을 한눈에 보는 GUI 인터페이스 구축.
