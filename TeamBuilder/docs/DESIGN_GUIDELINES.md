# TeamBuilder Design Guidelines & Lessons Learned

이 문서는 개발 과정에서 발생한 레이아웃 꼬임(State/CSS Conflict) 문제를 복기하고, 향후 유사한 오류를 방지하기 위한 디자인 철학 및 기술 지침을 기록합니다.

## 1. 발생했던 문제 (The Problem)

*   **CSS 우선순위 및 중복 정의**: `index.css`와 `App.css` 양쪽에서 `.main-content`를 정의하여 중앙 정렬 로직이 충돌함.
*   **비대칭 레이아웃**: 사이드바와 로그 패널의 너비가 달라(280px vs 320px) 중앙 대시보드가 물리적 화면 중앙에서 벗어나 보였음.
*   **컴포넌트 독립성 부족**: `MissionEditor` 등 중앙 컴포넌트가 부모의 정렬 방식에 의존하여, 폭이 좁아지거나 좌측으로 쏠리는 현상 발생.

## 2. 해결 방안 및 디자인 추천 (Recommendations)

### 📐 레이아웃 대칭성 (Symmetry as Default)
*   **원칙**: 3컬럼 레이아웃에서는 좌우 윙(Wing)의 너비를 동일하게 맞추는 것이 "작전 상황판"의 안정감을 줍니다.
*   **지침**: 특별한 이유가 없다면 사이드바와 보조 패널의 너비를 고정값(예: 300px)으로 통일하고 중앙 보드에 `1fr`을 할당하세요.

### 🧩 캡슐화된 스타일 (Encapsulated Centering)
*   **원칙**: 부모 컨테이너가 자식을 억지로 가운데로 모으기(`align-items: center`) 보다는, 자식 컨테이너 자체가 스스로의 최대 너비(`max-width`)를 가지고 중앙에 위치(`margin: 0 auto`)하도록 설계하는 것이 안전합니다.
*   **지침**: 중앙 정렬이 필요한 섹션은 별도의 `content-container`로 감싸고, 그 내부 요소들은 `width: 100%`를 기본으로 하여 부모의 너비를 꽉 채우게(Stretch) 하세요.

### 📂 CSS 역할 분리 (Strict CSS Separation)
*   **원칙**: `index.css`는 최상위 태그(html, body, #root)와 글로벌 테마 변수만 다루고, 구체적인 컴포넌트 레이아웃은 `App.css` 또는 `Component.module.css`에서 정의해야 합니다.
*   **지침**: 레이아웃 클래스 이름이 중복되지 않도록 주의하고, CSS 상속 구조를 단순하게 유지하세요.

## 3. 디자인 마인드셋 (Mindset)

> "화면이 곧 데이터고, 데이터가 곧 화면이다."

*   **GUI/CLI Parity**: 사용자가 터미널에서 보는 정보와 웹에서 보는 정보의 **위계(Hierarchy)**가 비대칭적일 때 사용자는 "꼬였다"고 느낍니다.
*   **Mission-First**: 항상 가장 중요한 정보(Mission, Current Step)는 시선의 정중앙 상단에 배치하고, 보조 정보(Logs, Staff)는 주변부에 배치하는 물리적 위계를 명확히 하세요.
