# ADR 010: Zen-Centric Artisanal UI Design

## Status
Accepted

## Context
기존의 TeamBuilder 대시보드 UI는 좌측 고정형 3단 그리드 구조를 사용하고 있었습니다. 이는 정보의 위계(Hierarchy)가 불분명하고, 메인 콘텐츠(미션 및 워크플로우)가 한쪽으로 치우쳐 시각적 균형이 맞지 않는 문제를 야기했습니다. 또한, 표준적인 AI 대시보드 구조를 따르고 있어 전문가용 도구로서의 '수공예적(Handcrafted)' 감성이 부족하다는 피드백이 있었습니다.

## Decision
시스템의 첫인상을 결정짓는 UX를 **"실큰 슬레이트(Silken Slate)"** 컨셉의 중앙 집중형 아키텍처로 개편하기로 결정했습니다.

1.  **중앙 집중 레이아웃 (Zen-Centric)**: `MainBoard`와 `WorkflowCanvas`에 `max-width`를 적용하고 화면 중앙에 배치하여 프로젝트의 '북극성'인 미션에 시선이 집중되도록 합니다.
2.  **플로팅 도크 (Floating Utility Docks)**: 사이드바와 로그 패널을 고정된 블록이 아닌, 반투명한 부유형 패널(Glass Card)로 재정의하여 가독성과 심미성을 동시에 확보합니다.
3.  **전문가용 타이포그래피**: 고해상도 디자인에 적합한 **Outfit**과 **Inter** 폰트의 조합을 채택하여 텍스트 질감을 고급화합니다.
4.  **장인 정신의 디테일 (Micro-Crafting)**: 0.5px 보더, 24px 백드롭 블러, 심도 있는 섀도우 레이어링을 통해 AI 생성이 아닌 정교하게 설계된 SaaS 제품의 인상을 구축합니다.

## Consequences
- **Positive**: 시각적 피로도가 감소하고, 가장 중요한 과업(Mission)에 대한 몰입도가 향상되었습니다. 전문가용 프리미엄 도구로서의 신뢰성(Professional Branding)이 한층 강화되었습니다.
- **Negative**: 레이아웃이 복잡해짐에 따라 CSS 유지보수 난이도가 약간 상승했으나, 전역 디자인 토큰(CSS Variables)을 통해 체계화함으로써 이를 해결했습니다.
