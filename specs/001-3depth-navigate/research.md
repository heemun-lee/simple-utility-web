# Research: 3-Depth Navigation with Gauge Converter

**Feature**: 001-3depth-navigate
**Date**: 2025-10-08
**Purpose**: 기술적 결정사항 조사 및 베스트 프랙티스 연구

## 1. SPA Routing Best Practices (Vanilla JavaScript)

### Decision: History API 기반 라우팅
**Chosen Approach**: `window.history.pushState()` + `popstate` 이벤트 리스너

**Rationale**:
- 브라우저 히스토리 네이티브 지원 (뒤로/앞으로 버튼 작동)
- URL 업데이트 없이 히스토리 상태 관리 가능
- SEO 친화적 URL (실제 경로 표시)
- 프레임워크 없이 간단히 구현 가능

**Implementation Pattern**:
```javascript
// router.js
const navigateTo = (url) => {
  history.pushState(null, null, url);
  loadPage(url);
};

window.addEventListener('popstate', () => {
  loadPage(location.pathname);
});
```

**Alternatives Considered**:
- Hash-based routing (#/page): SEO 불리, URL 가독성 낮음
- Third-party router library: 제로 디펜던시 원칙 위배

**References**:
- [MDN: History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Vanilla JS SPA Routing Pattern](https://dev.to/aminnairi/single-page-application-routing-with-vanilla-javascript-2e1h)

## 2. 3-Depth Menu Structure Implementation

### Decision: JSON 기반 계층적 메뉴 + 동적 렌더링
**Chosen Approach**: `menu.json` 파일에서 메뉴 구조 정의, JavaScript로 DOM 생성

**Rationale**:
- 데이터와 로직 분리 (새 메뉴 추가 시 코드 수정 불필요)
- JSON 구조로 depth 제한 및 확장 용이
- 재귀 렌더링 함수로 무한 depth 지원 (현재는 3depth로 제한)
- 성능: 한 번 로드 후 메모리 캐싱

**JSON Schema**:
```json
{
  "menu": [
    {
      "id": "category-1",
      "title": "카테고리 1",
      "children": [
        {
          "id": "subcategory-1-1",
          "title": "하위 카테고리 1-1",
          "children": [
            {
              "id": "feature-1-1-1",
              "title": "기능 1-1-1",
              "url": "/pages/feature.html"
            }
          ]
        }
      ]
    }
  ]
}
```

**Rendering Pattern**:
```javascript
// menu.js
const renderMenu = (items, depth = 0) => {
  if (depth >= 3) return; // 3depth 제한
  items.forEach(item => {
    const menuItem = createMenuItem(item, depth);
    if (item.children) {
      renderMenu(item.children, depth + 1);
    }
  });
};
```

**Alternatives Considered**:
- Hardcoded HTML: 유지보수 어려움, 확장성 낮음
- Database-driven: 서버 필요, GitHub Pages 불가
- CSS-only menu: JavaScript 없이 구현 가능하나 동적 로딩 불가

**References**:
- [JSON Schema for Nested Structures](https://json-schema.org/understanding-json-schema/reference/object.html)
- [Recursive DOM Rendering Pattern](https://javascript.info/recursion)

## 3. Page Caching Strategy

### Decision: Map 기반 인메모리 캐싱
**Chosen Approach**: `Map` 객체로 방문한 페이지 HTML 저장

**Rationale**:
- 성능: 같은 페이지 재방문 시 네트워크 요청 제거
- 메모리 효율: Map은 O(1) 조회, 가비지 컬렉션 친화적
- 간단한 구현: `cache.has(url) ? cache.get(url) : fetch(url)`
- 캐시 히트율 > 80% 목표 달성 가능

**Implementation**:
```javascript
// router.js
const pageCache = new Map();

const loadPage = async (url) => {
  if (pageCache.has(url)) {
    return pageCache.get(url); // 캐시 히트
  }

  const html = await fetch(url).then(res => res.text());
  pageCache.set(url, html); // 캐시 저장
  return html;
};
```

**Cache Invalidation**:
- 페이지 새로고침 시 캐시 초기화
- localStorage 활용한 영구 캐시는 향후 고려

**Alternatives Considered**:
- Browser cache (HTTP headers): 제어 어려움, GitHub Pages 설정 제한
- Service Worker: 복잡도 증가, 초기 버전에 과도함
- No caching: 성능 목표 미달

**References**:
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [SPA Caching Strategies](https://web.dev/performance-optimizing-content-efficiency/)

## 4. Gauge Conversion Algorithm

### Decision: 비율 기반 선형 변환
**Chosen Approach**: `변환값 = 입력값 × (실제게이지 / 기준게이지)`

**Mathematical Formula**:
```
변환된 단수 = 입력 단수 × (실제 단수 / 기준 단수)
변환된 코수 = 입력 코수 × (실제 코수 / 기준 코수)
```

**Example**:
```
기준: 10cm × 10cm = 25코 × 30단
실제: 10cm × 10cm = 20코 × 25단
입력: 100단

변환: 100 × (25/30) = 83.33단 (반올림: 83.33)
```

**Validation Rules**:
- 게이지 값 > 0 (0 나누기 방지)
- 게이지 값 < 1000 (실용성 제한)
- 음수 불가
- 결과 소수점 2자리 표시

**Implementation**:
```javascript
// validator.js
const convertGauge = (input, baseGauge, actualGauge) => {
  if (actualGauge === 0) throw new Error('실제 게이지는 0이 될 수 없습니다');
  return +(input * (actualGauge / baseGauge)).toFixed(2);
};
```

**Alternatives Considered**:
- 복잡한 수학 모델: 편물은 선형 관계, 과도한 복잡도
- 룩업 테이블: 유연성 부족, 메모리 낭비

**References**:
- [편물 게이지 계산법](https://www.purlsoho.com/create/gauge-conversion/)
- [JavaScript Number.toFixed()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)

## 5. Mobile Hamburger Menu Pattern

### Decision: CSS + JavaScript 토글 방식
**Chosen Approach**: Media query로 768px 이하 숨김, 햄버거 버튼 클릭 시 토글

**Implementation**:
```css
/* mobile.css */
@media (max-width: 768px) {
  .menu { display: none; }
  .menu.active { display: block; }
  .hamburger { display: block; }
}

@media (min-width: 769px) {
  .menu { display: block; }
  .hamburger { display: none; }
}
```

```javascript
// menu.js
const hamburger = document.querySelector('.hamburger');
hamburger.addEventListener('click', () => {
  document.querySelector('.menu').classList.toggle('active');
});
```

**Accessibility**:
- `aria-expanded` 속성으로 메뉴 상태 표시
- `aria-label="메뉴 열기"` 버튼 레이블
- Escape 키로 메뉴 닫기
- 터치 타겟 44×44px 이상

**Alternatives Considered**:
- Off-canvas drawer: 애니메이션 복잡도 증가
- Modal overlay: UX 과도함 (3depth 메뉴에 부적합)

**References**:
- [Responsive Navigation Patterns](https://www.smashingmagazine.com/2017/04/overview-responsive-navigation-patterns/)
- [Accessible Hamburger Menu](https://inclusive-components.design/menus-menu-buttons/)

## 6. Playwright Test Strategy

### Decision: 계층적 테스트 구조 (E2E → Visual → Accessibility)
**Test Categories**:
1. **E2E Tests**: 사용자 스토리별 완전한 플로우
2. **Visual Tests**: UI 컴포넌트 스냅샷 비교
3. **Accessibility Tests**: WCAG 2.1 AA 준수 검증

**E2E Test Pattern** (gauge-converter.spec.js):
```javascript
test('게이지 변환 계산', async ({ page }) => {
  await page.goto('/pages/gauge-converter.html');

  await page.fill('#base-stitches', '25');
  await page.fill('#base-rows', '30');
  await page.fill('#actual-stitches', '20');
  await page.fill('#actual-rows', '25');
  await page.fill('#input-rows', '100');

  await page.click('#calculate');

  await expect(page.locator('#result-rows')).toHaveText('120');
});
```

**Visual Test Pattern** (menu.spec.js):
```javascript
test('메뉴 UI 스냅샷', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('menu-desktop.png');

  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('menu-mobile.png');
});
```

**Accessibility Test Pattern** (wcag-menu.spec.js):
```javascript
test('메뉴 접근성 검증', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**Multi-Browser Strategy**:
- Chromium: 기본 테스트 (가장 빠름)
- Firefox: 크로스 브라우저 검증
- WebKit: Safari 호환성 (iOS 대응)

**References**:
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Visual Regression Testing](https://playwright.dev/docs/test-snapshots)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

## 7. Performance Optimization Techniques

### Decision: 다층 최적화 전략
**Techniques**:
1. **Critical CSS 인라인**: index.html <head>에 중요 스타일 삽입
2. **Resource Preload**: `<link rel="preload" href="menu.json">`
3. **CSS GPU Acceleration**: `transform: translateX()` 대신 `translate3d()`
4. **Debouncing**: 입력 필드 검증 300ms 지연

**Critical CSS Example**:
```html
<head>
  <style>
    /* 초기 렌더링에 필요한 최소 스타일 */
    body { margin: 0; font-family: system-ui; }
    .menu { /* 메뉴 레이아웃 */ }
  </style>
  <link rel="stylesheet" href="css/main.css">
</head>
```

**Animation Optimization**:
```css
/* 60fps 보장 */
.menu-item {
  transition: transform 0.3s ease;
  will-change: transform;
}

.menu-item:hover {
  transform: translate3d(0, -2px, 0); /* GPU 가속 */
}
```

**Debouncing Pattern**:
```javascript
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const validateInput = debounce((value) => {
  // 검증 로직
}, 300);
```

**Performance Budget Tracking**:
- Lighthouse CI 통합 (향후)
- Playwright `page.metrics()` 모니터링
- 각 릴리스 전 성능 체크리스트

**References**:
- [Critical CSS Techniques](https://web.dev/extract-critical-css/)
- [GPU Acceleration](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
- [Debouncing in JavaScript](https://davidwalsh.name/javascript-debounce-function)

## 8. Error Handling Strategy

### Decision: 계층적 에러 처리 (Validation → UI → Logging)
**Error Layers**:
1. **Input Validation**: 사용자 입력 즉시 검증
2. **UI Error Display**: 인라인 에러 메시지 표시
3. **Console Logging**: 개발자 디버깅용 상세 로그

**Validation Error Pattern**:
```javascript
// validator.js
const validateGauge = (value) => {
  if (value <= 0) {
    return { valid: false, error: '게이지 값은 0보다 커야 합니다' };
  }
  if (value > 1000) {
    return { valid: false, error: '게이지 값은 1000 이하여야 합니다' };
  }
  return { valid: true };
};
```

**UI Error Display**:
```javascript
const showError = (inputElement, message) => {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
  inputElement.classList.add('error');
};
```

**Graceful Degradation**:
```javascript
// menu.js
const loadMenu = async () => {
  try {
    const response = await fetch('/data/menu.json');
    if (!response.ok) throw new Error('Menu load failed');
    return await response.json();
  } catch (error) {
    console.error('Menu loading error:', error);
    return getDefaultMenu(); // 기본 메뉴 구조 반환
  }
};
```

**References**:
- [Error Handling Best Practices](https://www.joshwcomeau.com/javascript/error-handling/)
- [Graceful Degradation](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation)

## Summary

모든 기술적 결정사항이 조사 완료되었습니다. 헌법 원칙을 준수하며, 성능 및 접근성 목표를 달성할 수 있는 구현 방법이 확정되었습니다. Phase 1 (Design) 진행 준비 완료.
