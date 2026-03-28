# ADR-005: Leadership & Consensus Mechanism (리더십 및 합의 메커니즘)

## 상태 (Status)
Proposed (2026-03-28)

## 컨텍스트 (Context)
여러 명의 전문가(엔지니어, 보안 리뷰어, QA 등)가 협업할 때, 서로 의견이 다를 수 있습니다. 예를 들어 보안 리뷰어가 코드를 거부했을 때, 이를 누가 최종 판단하고 수정을 지시할지에 대한 규칙이 없으면 프로세스가 멈추거나 혼란에 빠질 수 있습니다.

## 결정 (Decision)
- **Architect as a Judge**: 기술적 논쟁이나 최종 배포 결정은 `architect` 또는 지정된 `lead_role`이 담당합니다.
- **Reject & Loop Logic**: 
  - 리뷰 계열의 Role(`reviewer`, `security_reviewer`)이 **Reject** 상태를 반환하면, 
  - 시스템은 해당 Job의 상태를 `In-Progress`로 되돌리고, 
  - 이전 단계의 담당자(`engineer`)에게 리뷰 내용을 포함한 수정 프롬프트를 자동으로 생성합니다.
- **Escalation**: 해결되지 않는 갈등은 사용자(Human-in-the-loop)에게 최종 승인을 요청합니다.

## 결과 (Consequences)
- 에이전트 간의 티키타카(Feedback Loop)가 자율적으로 이루어지며, 사용자의 개입 없이도 결과물의 품질이 향상됩니다.
- 갈등 상황에서도 프로세스가 정지되지 않고 리더 역할에 의해 흐름이 유지됩니다.
