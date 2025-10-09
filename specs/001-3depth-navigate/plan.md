# Implementation Plan: 3-Depth Navigation with Gauge Converter

**Branch**: `001-3depth-navigate` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-3depth-navigate/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

게이지 변환 계산기와 3단계 메뉴 네비게이션 시스템을 구현합니다. 사용자는 기준 게이지와 실제 게이지를 입력하여 변환된 단수/코수를 계산하고, 3depth 메뉴 구조를 통해 다양한 유틸리티 페이지로 이동할 수 있습니다.

**기술적 접근**: Vanilla JavaScript ES6+로 SPA 라우팅 시스템 구현, JSON 기반 동적 메뉴 생성, Map 기반 페이지 캐싱으로 성능 최적화, Playwright를 활용한 E2E 테스트 자동화.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES6+ (현대 브라우저 표준)
**Primary Dependencies**: 없음 (Vanilla JavaScript, 제로 디펜던시)
**Storage**: 클라이언트 측 메모리(Map), JSON 파일 (menu.json), localStorage (향후 사용자 설정용)
**Testing**: Playwright MCP (E2E, Visual Regression, Accessibility)
**Target Platform**: 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge), 모바일 웹
**Project Type**: Web (정적 사이트, SPA)
**Performance Goals**:
- 초기 로드 < 1초 (데스크톱), < 3초 (모바일 3G)
- 페이지 전환 < 300ms
- 게이지 계산 < 2초
- TTI < 2초 (데스크톱), < 5초 (모바일)
**Constraints**:
- 제로 디펜던시 (Vanilla JavaScript만 사용)
- GitHub Pages 배포 (정적 호스팅, 서버 사이드 로직 불가)
- 페이지 전환 300ms 이하
- 캐시 히트율 > 80%
**Scale/Scope**:
- 초기 1개 유틸리티 기능 (게이지 변환)
- 확장 가능한 3depth 메뉴 구조 (무제한 기능 추가 지원)
- 단일 사용자 세션 (동시 사용자 제한 없음, 클라이언트 측 처리)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Airbnb JavaScript Style Guide Compliance
- **Status**: 준수
- **Plan**: ES6+ 문법 사용 (const/let, arrow functions, template literals, destructuring)
- **Validation**: ESLint airbnb-base 설정으로 자동 검증

### ✅ II. Vanilla JavaScript First
- **Status**: 준수
- **Plan**: 외부 라이브러리 없이 네이티브 DOM API, Fetch API, History API 사용
- **Validation**: package.json 디펜던시 없음, 모든 기능 네이티브 구현

### ✅ III. Mobile-First Responsive Design
- **Status**: 준수
- **Plan**:
  - Mobile (< 768px): 햄버거 메뉴, 터치 최적화 (44x44px 타겟)
  - Tablet (768-1024px): 중간 레이아웃
  - Desktop (> 1024px): 전체 메뉴 표시
- **Validation**: Playwright 뷰포트 테스트 (375px, 768px, 1920px)

### ✅ IV. Performance and Optimization
- **Status**: 준수
- **Plan**:
  - Map 기반 페이지 캐싱 (visitedPages Map)
  - Critical CSS 인라인
  - menu.json preload
  - CSS transforms/opacity 애니메이션
- **Validation**: Lighthouse 성능 > 90, Playwright 성능 메트릭

### ✅ V. Accessibility and Semantic HTML
- **Status**: 준수
- **Plan**:
  - 시맨틱 태그 (<nav>, <main>, <article>)
  - ARIA 속성 (aria-expanded, aria-label, role)
  - 키보드 네비게이션 (Tab, Enter, Escape)
- **Validation**: Playwright accessibility assertions, axe-core 통합

### ✅ VI. GitHub Pages Deployment
- **Status**: 준수
- **Plan**:
  - 루트 디렉토리 배포 (index.html 진입점)
  - 상대 경로 사용
  - .nojekyll 파일 생성
- **Validation**: 로컬 및 GitHub Pages 환경 테스트

### ✅ VII. Playwright-Based UI Testing
- **Status**: 준수
- **Plan**:
  - E2E 테스트: 사용자 스토리별 시나리오
  - Visual 테스트: 메뉴, 계산기 UI
  - Accessibility 테스트: WCAG 2.1 AA
  - Multi-browser: Chromium, Firefox, WebKit
- **Validation**: 모든 테스트 통과 후 커밋

### ✅ File Organization
- **Status**: 준수
- **Plan**: 헌법 정의 구조 준수
```
/
├── index.html
├── css/ (main.css, menu.css, mobile.css)
├── js/ (utils.js, router.js, menu.js, validator.js)
├── data/ (menu.json)
├── pages/ (gauge-converter.html)
├── tests/ (e2e/, visual/, accessibility/)
└── .nojekyll
```

### ✅ Code Documentation
- **Status**: 준수
- **Plan**: JSDoc for all public functions, README.md, specs/

### ✅ Error Handling
- **Status**: 준수
- **Plan**: Try-catch for async ops, UI error messages, graceful degradation

### ✅ Version Control & Testing Workflow
- **Status**: 준수
- **Plan**:
  - Feature branch: 001-3depth-navigate
  - Conventional commits
  - Playwright 테스트 통과 후 커밋

## Project Structure

### Documentation (this feature)

```
specs/001-3depth-navigate/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── menu-structure.json  # Menu JSON schema
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
/
├── index.html              # 단일 진입점, SPA 셸
├── css/
│   ├── main.css           # 글로벌 스타일 (typography, colors, layout, 공통)
│   ├── menu.css           # 메뉴 컴포넌트 스타일 (3depth navigation, 공통)
│   ├── mobile.css         # 반응형 스타일 (media queries, 공통)
│   └── knitting-tools/    # 1depth: 편물 도구 카테고리
│       └── gauge-tools/   # 2depth: 게이지 관련
│           └── gauge-converter.css  # 3depth: 게이지 변환 계산기 전용 스타일
├── js/
│   ├── utils.js           # DOM 헬퍼, 이벤트 바인딩, 유틸리티 함수 (공통)
│   ├── router.js          # SPA 라우팅 (History API, 페이지 로드, 공통)
│   ├── menu.js            # 메뉴 관리 (JSON 로드, 렌더링, 이벤트, 공통)
│   └── knitting-tools/    # 1depth: 편물 도구 카테고리
│       └── gauge-tools/   # 2depth: 게이지 관련
│           ├── validator.js          # 게이지 검증 로직
│           └── gauge-converter.js   # 게이지 변환 계산 로직
├── data/
│   └── menu.json          # 3depth 메뉴 구조 정의
├── pages/
│   ├── home.html          # 홈 페이지 (메인 화면, 루트)
│   └── knitting-tools/    # 1depth: 편물 도구 카테고리
│       └── gauge-tools/   # 2depth: 게이지 관련
│           └── gauge-converter.html  # 3depth: 게이지 변환 계산기 페이지
├── tests/
│   ├── e2e/
│   │   ├── menu-navigation.spec.js  # 메뉴 네비게이션 E2E 테스트
│   │   ├── spa-routing.spec.js      # SPA 라우팅 E2E 테스트
│   │   └── knitting-tools/
│   │       └── gauge-tools/
│   │           └── gauge-converter.spec.js  # 게이지 계산 E2E 테스트
│   ├── visual/
│   │   ├── menu.spec.js             # 메뉴 UI 스냅샷 테스트
│   │   └── knitting-tools/
│   │       └── gauge-tools/
│   │           └── gauge-converter.spec.js  # 계산기 UI 스냅샷 테스트
│   └── accessibility/
│       ├── wcag-menu.spec.js        # 메뉴 접근성 테스트
│       └── knitting-tools/
│           └── gauge-tools/
│               └── gauge-converter.spec.js  # 계산기 접근성 테스트
└── .nojekyll              # GitHub Pages Jekyll 비활성화
```

**Structure Decision**:
- Web 프로젝트로 정적 사이트 구조 선택
- **공통 리소스**는 각 폴더의 루트에 배치 (main.css, menu.css, mobile.css, utils.js, router.js, menu.js)
- **기능별 리소스**는 메뉴 depth 구조와 동일한 서브폴더에 배치
  - 1depth: 카테고리명 폴더 (예: knitting-tools/)
  - 2depth: 하위 카테고리명 폴더 (예: gauge-tools/)
  - 3depth: 실제 페이지 파일 (예: gauge-converter.html)
- **확장성**: 새 기능 추가 시 메뉴 구조와 일치하는 폴더에 파일 추가
- **직관성**: 메뉴 경로 = 파일 경로 매핑으로 개발자 경험 향상

**폴더 구조 예시 (향후 확장)**:
```
css/converters/unit-converters/cm-to-inch.css
js/converters/unit-converters/cm-to-inch.js
pages/converters/unit-converters/cm-to-inch.html
```

## Complexity Tracking

*No violations - all constitution principles are satisfied by the planned architecture.*

---

## Phase 0: Research - ✅ COMPLETED

Research 문서가 생성되었습니다: [research.md](./research.md)

**완료된 조사 항목**:
- SPA Routing Best Practices (History API)
- 3-Depth Menu Structure Implementation (JSON 기반)
- Page Caching Strategy (Map 기반 인메모리)
- Gauge Conversion Algorithm (비율 기반 선형 변환)
- Mobile Hamburger Menu Pattern (CSS + JS 토글)
- Playwright Test Strategy (E2E, Visual, Accessibility)
- Performance Optimization Techniques (Critical CSS, GPU Acceleration)
- Error Handling Strategy (계층적 처리)

---

## Phase 1: Design - ✅ COMPLETED

Design 문서들이 생성되었습니다:
- [data-model.md](./data-model.md) - 6개 엔티티 정의 (Gauge, ConversionInput, ConversionResult, MenuItem, Page, RouterState)
- [contracts/menu-structure.json](./contracts/menu-structure.json) - JSON Schema 정의
- [quickstart.md](./quickstart.md) - 개발자 가이드

**Agent Context 업데이트**: ✅ CLAUDE.md 파일에 기술 스택 추가

---

## Constitution Check (Post-Design) - ✅ RE-VALIDATED

Phase 1 완료 후 재검증 결과, 모든 헌법 원칙이 준수되었습니다:

### ✅ I. Airbnb JavaScript Style Guide Compliance
- **Design Impact**: ES6+ 문법 사용, 모듈 패턴 적용
- **Validation**: quickstart.md 예제 코드 모두 Airbnb 스타일 준수

### ✅ II. Vanilla JavaScript First
- **Design Impact**: 외부 라이브러리 없음, 네이티브 API만 사용
- **Validation**: package.json에 디펜던시 없음, Playwright는 dev-only

### ✅ III. Mobile-First Responsive Design
- **Design Impact**: 햄버거 메뉴 패턴, 터치 타겟 44x44px
- **Validation**: quickstart.md에 모바일 우선 구현 가이드 포함

### ✅ IV. Performance and Optimization
- **Design Impact**: Map 캐싱, Critical CSS, GPU 가속
- **Validation**: research.md에 성능 최적화 기법 문서화

### ✅ V. Accessibility and Semantic HTML
- **Design Impact**: 시맨틱 태그, ARIA 속성, 키보드 네비게이션
- **Validation**: quickstart.md에 접근성 구현 포함

### ✅ VI. GitHub Pages Deployment
- **Design Impact**: .nojekyll 파일, 상대 경로
- **Validation**: quickstart.md에 배포 가이드 포함

### ✅ VII. Playwright-Based UI Testing
- **Design Impact**: E2E, Visual, Accessibility 테스트 구조
- **Validation**: quickstart.md에 Playwright 설정 및 예제 포함

**최종 검증 결과**: ✅ 모든 헌법 원칙 준수, 위반 사항 없음

---

## Next Phase

Phase 2는 `/speckit.tasks` 명령어로 진행됩니다. Tasks 문서에서 구체적인 구현 작업 목록을 생성합니다.
