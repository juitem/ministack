# ADR-007: SQLite Translucent DB (구조적 상태 관리로의 진화)

## 상태 (Status)
Proposed (2026-03-28)

## 컨텍스트 (Context)
기존의 단순 JSON 파일(`state_project.json`) 기반 상태 관리는 사용자가 직접 파일을 수정할 수 있다는 투명성(Headless UX) 면에서 훌륭하지만, 여러 에이전트가 동시에 참여하는 '전문가 지향 큐잉(Role-based Queuing)' 시스템을 구현하기에는 동시성 처리와 데이터 무결성 면에서 한계가 있습니다.

## 결정 (Decision)
- **내부 엔진 (Structured DB)**: Bun에 내장된 `SQLite`를 사용하여 `state.db`를 생성하고, Jobs와 Roles를 테이블 단위로 관리합니다.
- **Role-to-Role Delegation**: 각 Role은 다른 Role에게 새 Job을 생성하여 할당할 수 있습니다. 각 Role은 고유한 `In-box`를 가지며, 할당된 작업을 순차적 혹은 병렬로 처리합니다.
- **Dynamic Workflow**: 전체 워크플로우는 더 이상 고정된 선형(Linear) 구조가 아니라, 에이전트 간의 요청과 응답으로 구성된 동적(Emergent) 구조로 진화합니다.
- **외부 스냅샷 (Translucent Mirroring)**: 데이터베이스의 상태가 변할 때마다 자동으로 `state_project.json`을 업데이트하여 투명성을 유지합니다.

## 결과 (Consequences)
- **데이터 안정성**: 데이터베이스의 트랜잭션 기능을 통해 상태 전이가 안전해집니다.
- **기능 확장성**: 에이전트의 작업 이력 누적, 통계, 복잡한 필터링이 용이해집니다.
- **UX 유지**: 사용자는 여전히 JSON 파일을 보며 프로젝트 상태를 파악할 수 있는 "Headless UX"를 누립니다.
