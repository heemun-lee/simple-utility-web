# Research: SPA to MPA Conversion

**Date**: 2025-10-09 | **Feature**: 002-spa-to-mpa

## Research Objectives

1. MPA 구조에서의 공통 컴포넌트 관리 패턴
2. GitHub Pages에서의 MPA 최적 배포 전략
3. 페이지 간 네비게이션 및 상태 관리 방법
4. Playwright를 활용한 MPA 테스트 전략

---

## 1. Common Component Management in MPA

### Decision: Template Literal 기반 공통 컴포넌트

**Rationale**:
- 빌드 도구 없이 순수 JavaScript로 공통 UI 재사용 가능
- 각 페이지에서 동일한 네비게이션/푸터 렌더링
- HTML 템플릿 문자열을 JavaScript 모듈로 관리

**Implementation Pattern**:
```javascript
// js/components/nav.js
export const renderNavigation = (currentPage) => {
  return `
    <nav class="main-nav" role="navigation">
      <ul>
        <li><a href="index.html" ${currentPage === 'home' ? 'aria-current="page"' : ''}>홈</a></li>
        <li><a href="gauge-converter.html" ${currentPage === 'gauge-converter' ? 'aria-current="page"' : ''}>게이지 변환</a></li>
      </ul>
    </nav>
  `;
};
```

**Each Page Usage**:
```html
<!DOCTYPE html>
<html lang="ko">
<head>...</head>
<body>
  <div id="nav-container"></div>
  <main>...</main>

  <script type="module">
    import { renderNavigation } from './js/components/nav.js';
    document.getElementById('nav-container').innerHTML = renderNavigation('home');
  </script>
</body>
</html>
```

**Alternatives Considered**:
- **Server Side Includes (SSI)**: GitHub Pages 미지원
- **Web Components**: 오버킬, 복잡도 증가
- **iframe**: 접근성 및 SEO 문제

---

## 2. GitHub Pages MPA Deployment Strategy

### Decision: Root-Level HTML Files with Relative Paths

**Rationale**:
- GitHub Pages는 정적 파일 서빙에 최적화
- 각 HTML 파일을 루트에 배치하면 직접 URL 접근 가능
- 서브디렉토리 배포 시에도 상대 경로로 문제없음

**File Organization**:
```
/
├── index.html              # https://user.github.io/repo/
├── gauge-converter.html    # https://user.github.io/repo/gauge-converter.html
├── another-tool.html       # https://user.github.io/repo/another-tool.html
├── css/                    # Relative: ./css/main.css
├── js/                     # Relative: ./js/utils.js
└── data/                   # Relative: ./data/menu.json
```

**Path Strategy**:
- 모든 리소스 링크는 상대 경로 사용: `./css/main.css`, `./js/utils.js`
- 페이지 간 링크도 상대 경로: `<a href="./gauge-converter.html">`
- Base URL 불필요, 어느 서브디렉토리에서도 작동

**404 Handling**:
- `404.html` 생성하여 존재하지 않는 페이지 처리
- 사용자에게 홈으로 돌아가거나 메뉴에서 선택하도록 안내

**Alternatives Considered**:
- **Hash-based Routing**: MPA로 전환하는 목적에 맞지 않음
- **Nested Directories**: URL 구조 복잡, 불필요한 깊이
- **Absolute Paths**: 서브디렉토리 배포 시 문제 발생

---

## 3. Page Navigation and State Management

### Decision: URL Parameters + localStorage for State

**Rationale**:
- MPA에서는 페이지 간 상태 공유가 제한적
- 필요한 경우에만 최소한의 상태 유지
- URL 파라미터로 페이지 컨텍스트 전달
- localStorage로 사용자 설정 유지

**State Management Patterns**:

**A. URL Parameters (페이지 컨텍스트)**:
```javascript
// gauge-converter.html로 특정 단위 전달
<a href="gauge-converter.html?unit=awg&value=18">AWG 18 변환</a>

// 페이지에서 읽기
const params = new URLSearchParams(window.location.search);
const unit = params.get('unit');
const value = params.get('value');
```

**B. localStorage (사용자 설정)**:
```javascript
// 사용자 선호 설정 저장
localStorage.setItem('preferredUnit', 'mm');
localStorage.setItem('theme', 'dark');

// 다른 페이지에서 읽기
const preferredUnit = localStorage.getItem('preferredUnit') || 'mm';
```

**C. No Shared State (대부분의 경우)**:
- 각 페이지는 독립적으로 동작
- 필요한 데이터는 `menu.json`에서 로드
- 계산 결과는 페이지 내에서만 유지

**Alternatives Considered**:
- **Session Storage**: 탭 간 공유 불가, 제한적
- **Cookies**: 오버킬, 서버 전송 불필요
- **IndexedDB**: 복잡도 대비 이점 없음

---

## 4. Playwright MPA Testing Strategy

### Decision: Page-Based E2E Tests with Navigation Validation

**Rationale**:
- MPA에서는 각 페이지가 독립적인 진입점
- 페이지 로드, 네비게이션, 기능이 모두 검증 대상
- Playwright는 실제 브라우저에서 전체 페이지 로드 테스트에 최적

**Test Structure**:

**A. Navigation Tests** (`tests/e2e/navigation.spec.js`):
```javascript
test('홈에서 게이지 변환기로 이동', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href="gauge-converter.html"]');
  await expect(page).toHaveURL(/gauge-converter\.html/);
  await expect(page.locator('h1')).toContainText('게이지 변환');
});

test('모든 페이지에서 네비게이션 메뉴 표시', async ({ page }) => {
  const pages = ['/', '/gauge-converter.html', '/another-tool.html'];
  for (const pagePath of pages) {
    await page.goto(pagePath);
    await expect(page.locator('nav.main-nav')).toBeVisible();
  }
});
```

**B. Page-Specific Tests** (`tests/e2e/gauge-converter.spec.js`):
```javascript
test('게이지 변환 기능 동작', async ({ page }) => {
  await page.goto('/gauge-converter.html');
  await page.fill('input[name="gauge"]', '18');
  await page.selectOption('select[name="standard"]', 'awg');
  await page.click('button[type="submit"]');
  await expect(page.locator('.result')).toContainText('mm');
});
```

**C. Accessibility Tests** (`tests/accessibility/wcag.spec.js`):
```javascript
test('모든 페이지 WCAG AA 준수', async ({ page }) => {
  const pages = ['/', '/gauge-converter.html'];
  for (const pagePath of pages) {
    await page.goto(pagePath);
    const violations = await injectAxe(page);
    expect(violations).toHaveLength(0);
  }
});
```

**Test Execution Workflow**:
1. 로컬에서 모든 테스트 실행: `npm run test:playwright`
2. 실패 시 해당 페이지 수정 및 재실행
3. 모든 테스트 통과 후 커밋
4. CI/CD에서 자동 테스트 실행 및 배포

**Alternatives Considered**:
- **Unit Tests Only**: 통합 문제 놓칠 수 있음
- **Manual Testing Only**: 반복 작업 비효율, 회귀 위험
- **Selenium**: Playwright가 더 현대적이고 빠름

---

## 5. Performance Optimization for MPA

### Decision: Browser Caching + Preload Critical Resources

**Rationale**:
- MPA는 페이지마다 새로 로드하므로 캐싱이 중요
- 공통 CSS/JS는 브라우저 캐시로 재사용
- Critical resources는 preload로 우선 로드

**Optimization Strategies**:

**A. Cache Headers (GitHub Pages default)**:
```html
<!-- GitHub Pages는 자동으로 cache-control 헤더 설정 -->
<!-- Static assets: 1 year cache -->
```

**B. Resource Preloading**:
```html
<head>
  <!-- Critical CSS -->
  <link rel="preload" href="./css/main.css" as="style">
  <link rel="stylesheet" href="./css/main.css">

  <!-- Critical JS -->
  <link rel="modulepreload" href="./js/components/nav.js">

  <!-- Menu data -->
  <link rel="preload" href="./data/menu.json" as="fetch" crossorigin>
</head>
```

**C. Lazy Loading Non-Critical Content**:
```javascript
// 페이지 하단 이미지
<img src="./images/example.jpg" loading="lazy" alt="설명">

// 비필수 스크립트
<script src="./js/analytics.js" defer></script>
```

**Performance Targets**:
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 2s
- Total Blocking Time (TBT): < 200ms

---

## Implementation Recommendations

### Priority 1: Core MPA Structure
1. 각 페이지를 독립 HTML 파일로 생성
2. 공통 네비게이션 컴포넌트 구현 (`js/components/nav.js`)
3. `router.js` 제거 및 표준 링크로 전환

### Priority 2: Testing Infrastructure
1. Playwright 테스트 구조 업데이트 (e2e, visual, accessibility)
2. 페이지별 네비게이션 테스트 작성
3. CI/CD 파이프라인에 테스트 통합

### Priority 3: Performance Optimization
1. Critical resources에 preload 적용
2. 불필요한 JavaScript 제거 (라우터 관련)
3. Lighthouse 성능 측정 및 최적화

### Priority 4: Documentation
1. 각 페이지의 역할 및 사용법 문서화
2. MPA 구조 및 컴포넌트 패턴 설명
3. 새 페이지 추가 가이드 작성

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| 공통 UI 중복 코드 | Template literal 컴포넌트로 재사용 |
| 초기 로드 성능 저하 | Preload + 브라우저 캐싱 활용 |
| 테스트 커버리지 감소 | Playwright로 전 페이지 E2E 테스트 |
| SEO 영향 | 각 페이지의 메타 태그 최적화 |

---

---

## 6. 추가 개선사항 연구 (User Requirements)

### 6.1 반올림 계산 (Rounding Calculation)

**Decision**: 게이지 변환 결과를 정수로 반올림 (Math.round 적용)

**Current Implementation**:
```javascript
// validator.js:127, 153
return Number(result.toFixed(2)); // 소수점 2자리
```

**Rationale**:
- 편물 특성: 코수와 단수는 정수만 존재 (0.5코, 2.3단 불가)
- 사용성 개선: 소수점 값은 실제 뜨기 작업에서 무의미
- 실무 적용: 편물 작가들은 항상 정수로 반올림

**Implementation**:
```javascript
// Before
const result = input * (actual / base);
return Number(result.toFixed(2));

// After
const result = input * (actual / base);
return Math.round(result);
```

**Testing Impact**:
- `gauge-function.spec.js` 업데이트
- 반올림 테스트 케이스 추가: 25.4→25, 25.5→26, 25.6→26

---

### 6.2 "메인 콘텐츠로 건너뛰기" 버튼 제거

**Decision**: ✅ Option B - 완전 제거 (사용자 승인)

**Current State**:
```html
<!-- gauge-converter.html:18 -->
<a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a>
```

**User Decision Rationale**:
- UI 단순화 우선
- 현재 네비게이션이 짧아 효용성 낮음
- 사용자 경험 개선을 위한 트레이드오프 수용

**Accessibility Trade-off**:
- WCAG 2.1 AA 완전 준수는 아니지만 실용성 우선
- 네비게이션이 짧아 키보드 사용자의 실제 불편은 최소화
- Constitution V. Accessibility 예외 승인 (사용자 결정)

**Implementation**:
```html
<!-- Remove from all HTML files -->
<!-- gauge-converter.html:18 -->
<!-- <a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a> -->

<!-- index.html:18 -->
<!-- <a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a> -->
```

**Testing Impact**:
- `gauge-wcag.spec.js`, `home-wcag.spec.js` 업데이트
- Axe-core skip link 검증 제외 필요
- 접근성 테스트에서 skip link 관련 규칙 비활성화

---

### 6.3 파스텔 핑크 디자인

**Decision**: 파스텔 핑크 메인 색상 (#FEEFEF)의 귀엽고 깔끔한 UI

**Target Audience**:
- 주 사용자: 여성 편물 작가 및 취미 활동가
- 디자인 방향: 친근하고 부드러운 분위기 + 전문성 유지

**Color Palette** (Updated):

| Color Name | Hex | Usage | WCAG AA |
|-----------|-----|-------|---------|
| Soft Blush | `#FEEFEF` | Primary background, cards | ✅ |
| Rose Pink | `#FFD4D4` | Accent, highlights | ✅ |
| Deep Pink | `#FFB6C1` | Buttons, hover states | ✅ |
| White | `#FFFFFF` | Main background | - |
| Light Gray | `#F8F8F8` | Secondary backgrounds | ✅ |
| Dark Gray | `#333333` | Text | ✅ (4.5:1) |
| Mint Green | `#D4F4DD` | Success states | ✅ |
| Soft Red | `#FFE0E0` | Error states | ✅ |

**Implementation**:
```css
/* main.css 업데이트 */
:root {
  /* Primary Colors - Soft Pastel Pink Theme */
  --color-primary: #FEEFEF;          /* Main soft pink background */
  --color-primary-accent: #FFD4D4;   /* Rose pink accent */
  --color-primary-dark: #FFB6C1;     /* Deep pink for buttons */

  /* Supporting Colors */
  --color-background: #FFFFFF;
  --color-background-secondary: #F8F8F8;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-success: #D4F4DD;
  --color-error: #FFE0E0;
}

/* Button styles */
.calculate-button {
  background: var(--color-primary-dark);
  color: white;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.calculate-button:hover {
  background: #FF9FAB;  /* Slightly darker pink */
}

/* Section/Card styles */
.gauge-section {
  background: var(--color-primary);
  border-left: 4px solid var(--color-primary-dark);
  border-radius: 8px;
  padding: 1.5rem;
}

/* Input focus */
input:focus {
  border-color: var(--color-primary-dark);
  outline: 2px solid var(--color-primary-accent);
}
```

**Design Principles**:
1. **가독성 우선**: WCAG AA 대비율 준수 (4.5:1)
2. **일관성**: 모든 페이지 동일 색상 시스템
3. **반응형**: Mobile-first, 터치 최적화
4. **부드러운 느낌**: #FEEFEF의 매우 연한 핑크로 편안한 분위기

**Testing Impact**:
- Playwright visual regression tests 업데이트
- Axe-core 색상 대비율 자동 검증
- 스냅샷 이미지 재생성 필요

---

## Next Steps

1. **Phase 1**: 데이터 모델 및 계약 정의
   - 페이지 구조 정의
   - 공통 컴포넌트 인터페이스 설계
   - Navigation API 명세
   - **NEW**: 디자인 시스템 (색상, 타이포그래피)

2. **Implementation**: 실제 MPA 변환 + 개선사항 적용
   - 기존 `/pages/` 콘텐츠를 루트 레벨 HTML로 이동
   - `router.js` 제거 및 네비게이션 컴포넌트 구현
   - **NEW**: 반올림 계산 적용 (validator.js)
   - **NEW**: Skip link 처리 (사용자 확인 후)
   - **NEW**: 파스텔 핑크 디자인 적용
   - Playwright 테스트 작성 및 검증
