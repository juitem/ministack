# ADR-008: Agent Hierarchy & Authority (권한 체계 도입)

## 상태 (Status)
Proposed (2026-03-28)

## 컨텍스트 (Context)
모든 에이전트(Role)가 서로에게 무분별하게 업무를 위임(Delegation)하면 워크플로우 통제가 불가능해지고 무한 루프나 책임 소재 불분명 문제가 발생할 수 있습니다. 전문적인 팀 운영을 위해 에이전트 간의 위계와 권한 체계가 필요합니다.

## 결정 (Decision)
- **Role Taxonomy (위계 정의)**:
    - **Orchestrator (Cluster Lead)**: 특정 역할 그룹(Cluster)의 전체 방향을 결정하고, 타 그룹으로부터 온 업무를 내부 멤버들에게 배분(Routing)함.
    - **Manager**: 특정 도메인의 책임을 지며, 하위 Contributor에게 세부 Job을 위임할 권한을 가짐.
    - **Contributor**: 할당된 Job을 수행하며, 타인에게 위임하기보다는 본인의 작업 결과만 보고함.
- **Cluster-based Routing**: 
    - 타 역할(Role B)에게 업무를 요청할 때는 개별 멤버가 아닌 해당 역할 그룹의 **Orchestrator**에게 요청을 보냅니다.
    - 그룹의 Orchestrator는 가용 상태인 멤버들에게 병렬(Parallel)로 작업을 배분하거나 상호 리뷰(Cross-Review)를 지시합니다.
- **Authority Validation**:
    - 시스템은 Job 생성/위임 시 `source_role`의 권한 등급이 `target_role`보다 높거나 같은지 검증합니다.
    - 역방향 위임(Contributor -> Manager)은 '보고'나 '질문' 형태의 특수 Job 타입으로 제한합니다.

## 결과 (Consequences)
- **질서 있는 위임**: 무분별한 작업 분산이 억제되고 팀 구조가 명확해집니다.
- **가시성**: UI의 사이드바에서 지휘 계통(Command Chain)을 시각적으로 표현할 수 있습니다.
- **책임성**: 하위 작업의 결과가 결국 상위 매니저에게 피드백되는 루프가 형성됩니다.
