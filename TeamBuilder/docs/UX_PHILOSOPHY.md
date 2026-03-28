# TeamBuilder: UX & Design Philosophy

이 문서는 TeamBuilder 대시보드를 구축하고 디버깅할 때 기준이 되는 사용자 경험(UX)과 디자인 철학을 명세합니다. 모든 컴포넌트 확장 및 오류 수정은 이 철학을 위배하지 않는 선에서 이루어져야 합니다.

## 1. 핵심 철학: 작전 상황판 (Mission Control)

TeamBuilder의 UI는 DevOps 관제 모니터가 아닙니다. 
우리는 자원(CPU, API 토큰 등)을 감시하는 것이 아니라, **사람(AI 에이전트)과 일(Task)**을 연결하는 채용/관리 플랫폼입니다.

*   **포커스**: "누가(Who)" "어떤 목적(Mission)"을 위해 "무슨 일(What)"을 하고 있는가?
*   **배제할 요소**: 인프라 관점의 수치 표기, 복잡하고 딱딱한 테이블 그리드 형태의 나열.

## 2. 시각적 메타포 (Visual Metaphors)

UX 요소들은 사용자가 무의식적으로 '팀을 꾸리고 있다'는 느낌을 주도록 설계되었습니다.

1.  **Talent Market (인력 풀)**: 쇼핑몰이나 카드 게임의 덱(Deck)처럼, 고유한 포트레잇(아이콘)과 능력치(Specialty)가 강조되는 카드 형태.
2.  **Workflow Canvas (작업 지시서)**: 조립 라인이나 보드 게임의 칸처럼, 순차적으로 이어지는 블록 시퀀스. 빈 슬롯에 인재 카드를 '끼워 넣는(Assign)' 직관적 형태.
3.  **Mission Briefing (목표)**: 항상 대시보드 최상단 북극성 위치에 존재하여, 이 팀이 무얼 위해 모였는지 잊지 않도록 강제.

## 3. 디자인 스타일: Modern Glassmorphism

어둡고 진지한 전문가의 작업 공간을 연출하기 위해 **다크 모드 + 글래스모피즘(Glassmorphism)**을 기본 테마로 채택합니다.

*   **배경**: 깊이감 있는 짙은 색상(Deep Space, Dark Slate 등)에 은은한 오로라/그라데이션 빛 번짐 효과.
*   **컴포넌트**: 반투명한 패널(`backdrop-blur`), 얇은 화이트/네온 보더 텍스처, 은은한 그림자를 통해 화면 내 계층(Hierarchy) 구분.
*   **상호작용(Interaction)**: 마우스 호버(Hover) 시 카드의 미세한 부유(Float) 애니메이션, 배정 전/후의 명확한 테두리 형광색 타격감(Glow) 제공.

## 4. 구조적 대원칙: 엔진과의 1:1 거울(Mirror) 동기화

UX에서 발생하는 꼬임(Tangled State)을 막기 위한 기술적 UX 원칙입니다.

*   **Single Source of Truth**: 대시보드의 상태는 CLI 엔진(`ministack.ts`/`.py`)이 참조하는 `state_project.json` 및 `state_execution.json` 파일과 완벽히 동기화되어야 합니다.
*   **실시간 반영 (Reactivity)**: 사용자가 브라우저가 아닌 터미널에서 `ministack assign`이나 `ministack next`를 입력하더라도, 대시보드는 이를 즉각 감지하고 UI 트랜지션을 발생시켜야 합니다. "화면과 엔진 사이의 단절감"은 최우선 척결 대상입니다.
*   **활동 로그 (Activity Log)**: 에러 알럿 프롬프트보다는, 우측 하단이나 사이드 패널의 타임라인 로그 형태로 시스템의 응답 방식을 통일하여 '작전 지시 기록'의 느낌을 줍니다.

## 5. Headless UX (CLI 및 파일 시스템 UX 철학)

대시보드(화면)가 존재하지 않는 터미널 환경과 파일 시스템 역시 TeamBuilder의

## 3. 사용자 관점의 디자인 철학 (User-Centric Philosophy)

사용자가 TeamBuilder를 대할 때 느끼는 핵심 경험은 **"가장 진보된 작전 통제실(Advanced Mission Control)"**에 앉아 있는 것입니다.

### 🏛️ [본주: Mission Control] - "실전과 통제"
- **High-Level Visibility**: 전체 프로젝트의 진행 상태를 한눈에 파악할 수 있는 '신(God)'의 시점을 제공합니다. 
- **Dynamic Orchestration**: 에이전트 간의 티키타카(위임 흐름)를 시각적인 화살표나 흐름도로 표현하여, 복잡한 협업 과정이 마치 살아있는 생명체처럼 보이게 합니다.

### 🏙️ [인력 공소: Personnel Agency] - "애착과 성장"
- **AI as an Asset**: 에이전트를 소모품이 아닌 '인적 자산'으로 대우합니다. 성격, 백스토리, 훈련 기록이 강조된 인터페이스를 통해 전문가들과의 유대감을 형성합니다.
- **Talent Market Visualization**: 새로운 전문가를 영입할 때, 마치 실제 인재 시장을 둘러보는 듯한 설렘과 프리미엄한 경험(Shop-like UX)을 제공합니다.

### 🪄 디자인 에스테틱 (Tactical SF Aesthetics)
- **Glassmorphism & Dark Mode**: 반투명한 레이어와 정교한 그림자(Glow Shadow)를 사용하여, 20세기 사무용 소프트웨어가 아닌 22세기의 하이테크 도구를 쓰는 감각을 전달합니다.
- **Progressive Disclosure**: 초반에는 단순한 미션 중심의 UI를 보여주지만, 필요할 때 클러스터나 병렬 작업 같은 복잡한 도구들이 우아하게 노출(Unfold)되도록 설계합니다.

### 📂 로컬 우선의 손맛 (Tactile Local-First)
- **File System Transparency**: 모든 UI 동작은 실제 로컬 파일(`state.json`, `docs/`)의 변화를 동기화합니다. "구름 위에 떠 있는 DB"가 아니라 "내 맥북 안에서 조용히 일하는 팀원들"이라는 실체감을 줍니다.

1.  **Local-First Principle (투명한 상태 관리)**: 마치 `git`처럼, 모든 프로젝트 상태(`state_project.json`)와 영입된 팀원 데이터(`roles/`)는 현재 작업 디렉토리(CWD)에 투명하게 파일로 존재합니다. 사용자는 숨겨진 DB를 조회할 필요 없이, 폴더만 열어봐도 우리 팀의 상태를 100% 파악할 수 있어야 합니다.
2.  **Markdown as UI (텍스트 기반 인터페이스)**: AI 에이전트 페르소나는 복잡한 UI 폼이나 JSON이 아닌 직관적인 `.md` 파일입니다. 텍스트 에디터로 마크다운 파일을 열어 지시사항을 수정하는 행위 자체가 곧 "에이전트 교육(Training)"이라는 최고의 UX를 제공합니다.
3.  **Unix 철학과 조립성 (Composability)**: `recruit`, `assign`, `start`, `next` 와 같은 CLI 명령어들은 각각 하나의 명확한 목적만 수행합니다. 파이프라인으로 연결하거나 스크립트화하기 쉬운결합성을 가져야 합니다.
4.  **멱등성과 안전성 (Idempotency & Resilience)**: `ministack back`을 통해 이전 단계로 돌아가거나 설정을 반복해서 덮어써도 데이터가 파괴되지 않는 안정성을 보장해야 합니다.
