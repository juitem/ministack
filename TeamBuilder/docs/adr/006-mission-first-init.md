# ADR-006: Mission-First Project Initialization (미션 우선 프로젝트 초기화)

## 상태 (Status)
Proposed (2026-03-28)

## 컨텍스트 (Context)
현재 시스템은 워크플로우를 먼저 선택하고 전문가를 영입하는 방식입니다. 하지만 실제 프로젝트는 "어떤 제품을 만들 것인가"라는 목표에서 시작됩니다. 이 목표(Mission)가 정의되어야 어떤 전문가가 필요한지(Recruit), 각각 어떤 지시를 받아야 하는지(Context)가 결정됩니다.

## 결정 (Decision)
- **Single Source of Truth**: 모든 프로젝트의 최상위에 `docs/mission.md` 파일을 생성하고, 사용자가 입력한 "최종 제품의 정의와 목표"를 기록합니다.
- **Context Injection**: 모든 에이전트의 프롬프트 생성 시, `role.md`와 `job.md` 외에 `mission.md`의 내용을 **'Global Mission'** 섹션으로 반드시 포함시킵니다.
- **Dashboard UX**: 대시보드의 메인 헤더를 단순한 텍스트가 아닌, **언제든 수정 가능한 '미션 에디터'**로 구현하여 제품의 방향성이 바뀌면 팀 전체가 즉시 인지하도록 합니다.

## 결과 (Consequences)
- 팀 빌딩과 제품 개발이 별개가 아닌, 하나의 목표를 향해 정렬(Align)됩니다.
- 에이전트들이 "왜 이 일을 하는지"에 대한 맥락을 이해하게 되어 산출물의 정합성이 높아집니다.
