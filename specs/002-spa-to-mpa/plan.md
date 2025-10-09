# Implementation Plan: SPA to MPA Conversion

**Branch**: `002-spa-to-mpa` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-spa-to-mpa/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

현재 SPA 구조를 전통적인 MPA로 전환하여 각 유틸리티 페이지가 독립적인 HTML 파일로 제공되도록 변경. 클라이언트 사이드 라우터(router.js)를 제거하고 브라우저 네이티브 페이지 전환을 사용하여 GitHub Pages 호환성과 접근성을 개선.

**추가 요구사항**:
1. 게이지 변환 시 반올림 계산 (소수점 코수/단수 없음)
2. "메인 콘텐츠로 건너뛰기" 버튼 제거
3. 파스텔 핑크 메인 색상의 귀엽고 깔끔한 디자인

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES6+ (현대 브라우저 표준)
**Primary Dependencies**: 없음 (Vanilla JavaScript, 제로 디펜던시)
**Storage**: N/A (정적 사이트, 로컬 스토리지만 사용)
**Testing**: Playwright (E2E, Visual, Accessibility)
**Target Platform**: GitHub Pages (정적 호스팅), 현대 브라우저 (Chrome, Firefox, Safari, Edge)
**Project Type**: Web (MPA 전환 예정)
**Performance Goals**:
- 초기 페이지 로드: < 1s (desktop), < 3s (mobile 3G)
- 페이지 전환: 브라우저 네이티브 속도
**Constraints**:
- GitHub Pages 제약 (서버 로직 없음, 정적 파일만)
- 제로 디펜던시 원칙 유지
- WCAG 2.1 AA 준수
**Scale/Scope**:
- 현재 1개 유틸리티 (게이지 변환기)
- 향후 추가 편물 유틸리티 확장 예정
- 개인 사용자 대상 (여성 주 사용자층)

**추가 개선사항**:
1. **반올림 계산**: 게이지 변환 시 소수점 제거 (Math.round 적용)
2. **Skip link 제거**: "메인 콘텐츠로 건너뛰기" 버튼 완전 제거 (사용자 승인)
3. **디자인 리뉴얼**: 파스텔 핑크 색상 #FEEFEF 기반 귀엽고 깔끔한 UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Airbnb JavaScript Style Guide Compliance
✅ **PASS** - 모든 JavaScript 코드는 Airbnb 스타일 가이드 준수
- 현재 코드 검토: const/let 사용, ES6+ 기능 사용
- 추가 작업 없음

### II. Vanilla JavaScript First
✅ **PASS** - 제로 디펜던시 원칙 유지
- 외부 라이브러리 없음
- 네이티브 DOM API 사용
- 추가 작업 없음

### III. Mobile-First Responsive Design
✅ **PASS** - 반응형 디자인 유지
- 기존 breakpoints 유지: < 768px (mobile), 768-1024px (tablet), > 1024px (desktop)
- 파스텔 핑크 디자인 적용 시 반응형 유지

### IV. Performance and Optimization
✅ **PASS** - 성능 요구사항 충족
- MPA 전환으로 초기 로드 개선 예상
- 브라우저 캐싱 활용
- 추가 최적화 작업 없음

### V. Accessibility and Semantic HTML
✅ **PASS (with exception)** - "메인 콘텐츠로 건너뛰기" 버튼 제거 승인
- **현재 상태**: WCAG 2.1 AA 준수를 위해 skip link 포함
- **최종 결정**: 사용자 승인에 따라 완전 제거 (Option B)
- **영향 분석**: 키보드 사용자 접근성 저하, 그러나 네비게이션이 짧아 실제 불편 최소화
- **Constitution 예외**: 사용자 경험 우선, 실용성 고려한 트레이드오프

### VI. GitHub Pages Deployment
✅ **PASS** - GitHub Pages 호환성 유지
- MPA 구조로 직접 URL 접근 개선
- .nojekyll 파일 존재
- 추가 작업 없음

### VII. Playwright-Based UI Testing
✅ **PASS** - 기존 테스트 유지 및 업데이트
- 현재 테스트: E2E, Visual, Accessibility
- MPA 전환 후 테스트 업데이트 필요
- 모든 테스트 통과 후 커밋

### 추가 개선사항 검증
1. ✅ **반올림 계산**: validator.js의 toFixed(2) → Math.round() 변경
2. ✅ **Skip link 제거**: Option B 완전 제거 (사용자 승인)
3. ✅ **디자인 리뉴얼**: 파스텔 핑크 색상 #FEEFEF 적용

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
/ (repository root)
├── index.html                        # 홈 페이지 (MPA)
├── gauge-converter.html              # 게이지 변환기 페이지 (MPA)
├── .nojekyll                         # GitHub Pages 설정
│
├── css/
│   ├── main.css                      # 글로벌 스타일 (파스텔 핑크 테마)
│   ├── components.css                # 공통 컴포넌트 스타일
│   ├── home.css                      # 홈 페이지 스타일
│   └── knitting-tools/
│       └── gauge-tools/
│           └── gauge-converter.css   # 게이지 변환기 스타일
│
├── js/
│   ├── utils.js                      # 유틸리티 함수
│   ├── utils/
│   │   └── menu-loader.js            # 메뉴 데이터 로더
│   ├── components/
│   │   ├── nav.js                    # 네비게이션 컴포넌트
│   │   ├── footer.js                 # 푸터 컴포넌트
│   │   └── error.js                  # 에러 핸들러
│   └── knitting-tools/
│       └── gauge-tools/
│           ├── gauge-converter.js    # 게이지 변환 로직
│           └── validator.js          # 검증 및 변환 로직 (반올림 개선)
│
├── data/
│   └── menu.json                     # 메뉴 구조 데이터
│
├── tests/
│   ├── e2e/
│   │   ├── home-navigation.spec.js
│   │   ├── home-content.spec.js
│   │   ├── gauge-nav.spec.js
│   │   ├── gauge-function.spec.js    # 반올림 계산 테스트 추가
│   │   └── mpa-verification.spec.js
│   └── accessibility/
│       ├── home-wcag.spec.js
│       └── gauge-wcag.spec.js        # Skip link 제거 반영
│
└── specs/
    └── 002-spa-to-mpa/
        ├── spec.md
        ├── plan.md                   # 현재 파일
        ├── research.md               # Phase 0 생성 예정
        ├── data-model.md             # Phase 1 생성 예정
        ├── quickstart.md             # Phase 1 생성 예정
        └── contracts/                # Phase 1 생성 예정
```

**Structure Decision**:
- **Web Application (MPA)**: 독립적인 HTML 페이지 구조
- **현재 상태**: 이미 MPA로 전환 완료 (router.js 제거됨)
- **추가 개선**: 반올림 계산, skip link 제거, 디자인 개선

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Skip link 제거 | 사용자 요청 (UI 단순화) | WCAG 2.1 AA 준수를 위해 skip link 권장되나, 사용자 UX 선호도 우선 고려. 향후 재검토 필요. |

**Note**: Skip link 제거는 접근성 저하를 야기할 수 있으므로, 사용자와 재논의 권장.
