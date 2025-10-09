# Page Structure Contract

**Feature**: 002-spa-to-mpa | **Date**: 2025-10-09

## Overview

모든 페이지는 표준화된 구조를 따라야 합니다. 이 계약은 페이지 HTML 구조, 필수 요소, 메타데이터 규칙을 정의합니다.

---

## 1. HTML Document Structure

### Minimal Required Structure

모든 페이지는 다음 구조를 반드시 포함해야 합니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <!-- 필수 메타 태그 -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{PAGE_DESCRIPTION}">

  <!-- 페이지 제목 -->
  <title>{PAGE_TITLE} - Simple Utility Web</title>

  <!-- 공통 스타일시트 (순서 중요) -->
  <link rel="stylesheet" href="./css/main.css">
  <link rel="stylesheet" href="./css/components.css">

  <!-- 페이지별 스타일시트 (선택) -->
  <link rel="stylesheet" href="./css/{PAGE_ID}.css">

  <!-- Preload 최적화 (선택) -->
  <link rel="modulepreload" href="./js/components/nav.js">
  <link rel="preload" href="./data/menu.json" as="fetch" crossorigin>
</head>
<body>
  <!-- 네비게이션 컨테이너 -->
  <div id="nav-container"></div>

  <!-- 메인 콘텐츠 -->
  <main id="main-content" role="main">
    <h1>{PAGE_HEADING}</h1>
    <!-- 페이지별 콘텐츠 -->
  </main>

  <!-- 푸터 컨테이너 -->
  <div id="footer-container"></div>

  <!-- 공통 컴포넌트 로드 -->
  <script type="module">
    import { renderNavigation } from './js/components/nav.js';
    import { renderFooter } from './js/components/footer.js';

    document.getElementById('nav-container').innerHTML = await renderNavigation('{PAGE_ID}');
    document.getElementById('footer-container').innerHTML = renderFooter();
  </script>

  <!-- 페이지별 스크립트 (선택) -->
  <script type="module" src="./js/{PAGE_ID}.js"></script>
</body>
</html>
```

---

## 2. Mandatory Elements

### A. Meta Tags

**필수 메타 태그**:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{설명}">
```

**선택 메타 태그** (SEO 최적화):
```html
<meta name="keywords" content="{키워드1}, {키워드2}, ...">
<meta name="author" content="Simple Utility Web">

<!-- Open Graph (소셜 미디어 공유) -->
<meta property="og:title" content="{페이지 제목}">
<meta property="og:description" content="{설명}">
<meta property="og:image" content="./images/{페이지-이미지}.png">
<meta property="og:url" content="https://user.github.io/repo/{페이지}.html">
<meta property="og:type" content="website">
```

**제약 사항**:
- `description`: 50-160자 (SEO 최적)
- `keywords`: 최대 10개
- `title`: 10-60자

---

### B. Semantic HTML

**필수 시맨틱 요소**:
- `<main>`: 주요 콘텐츠 (페이지당 1개)
- `<nav>`: 네비게이션 (컴포넌트로 삽입)
- `<footer>`: 푸터 (컴포넌트로 삽입)

**권장 시맨틱 요소**:
- `<article>`: 독립적인 콘텐츠
- `<section>`: 주제별 섹션
- `<header>`: 섹션 헤더
- `<aside>`: 부가 정보

**예시** (게이지 변환기):
```html
<main id="main-content" role="main">
  <header>
    <h1>게이지 변환기</h1>
    <p class="lead">AWG, SWG, BWG 게이지를 mm, inch 단위로 변환합니다.</p>
  </header>

  <article class="converter-tool">
    <section class="input-section">
      <h2>입력</h2>
      <!-- 입력 폼 -->
    </section>

    <section class="result-section">
      <h2>결과</h2>
      <!-- 결과 표시 -->
    </section>
  </article>

  <aside class="info-section">
    <h2>게이지란?</h2>
    <p>...</p>
  </aside>
</main>
```

---

### C. Accessibility Requirements

**필수 ARIA 속성**:
```html
<main id="main-content" role="main" aria-label="{페이지 제목}">
  ...
</main>

<nav role="navigation" aria-label="주요 메뉴">
  ...
</nav>

<button aria-label="{버튼 설명}" aria-pressed="false">
  ...
</button>
```

**키보드 네비게이션**:
- 모든 상호작용 요소는 `Tab`으로 접근 가능
- `Enter` 또는 `Space`로 활성화
- `Escape`로 모달/메뉴 닫기

**스크린 리더 지원**:
- `alt` 속성 (이미지)
- `aria-label` (버튼, 링크)
- `aria-live` (동적 콘텐츠)
- `aria-current="page"` (현재 페이지)

---

## 3. Resource Loading Contract

### A. CSS Loading Order

**순서 엄수 필수**:
1. `main.css` - 기본 스타일, 리셋, 변수
2. `components.css` - 공통 컴포넌트 스타일
3. `{page-id}.css` - 페이지별 스타일 (선택)

**예시**:
```html
<link rel="stylesheet" href="./css/main.css">
<link rel="stylesheet" href="./css/components.css">
<link rel="stylesheet" href="./css/gauge-converter.css">
```

---

### B. JavaScript Loading Strategy

**ES6 모듈 사용**:
```html
<script type="module">
  import { renderNavigation } from './js/components/nav.js';
  // ...
</script>
```

**로딩 순서**:
1. 공통 컴포넌트 (nav, footer) - `<head>` 또는 `<body>` 하단
2. 페이지별 스크립트 - `<body>` 하단

**비동기 로딩** (선택):
```html
<script type="module" src="./js/{page-id}.js" defer></script>
```

---

### C. Performance Optimization

**Preload Critical Resources**:
```html
<link rel="preload" href="./css/main.css" as="style">
<link rel="modulepreload" href="./js/components/nav.js">
<link rel="preload" href="./data/menu.json" as="fetch" crossorigin>
```

**Lazy Loading**:
```html
<!-- 이미지 -->
<img src="./images/example.jpg" loading="lazy" alt="설명">

<!-- 비필수 스크립트 -->
<script src="./js/analytics.js" defer></script>
```

**성능 목표**:
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 2s

---

## 4. Page-Specific Variations

### A. Home Page (`index.html`)

**특징**:
- 유틸리티 목록 표시
- 각 유틸리티 카드 형태로 링크
- 검색/필터 기능 (선택)

**구조**:
```html
<main id="main-content" role="main">
  <header class="hero">
    <h1>Simple Utility Web</h1>
    <p>다양한 유틸리티 도구 모음</p>
  </header>

  <section class="utilities-grid">
    <article class="utility-card">
      <h2>게이지 변환기</h2>
      <p>AWG, SWG, BWG 게이지를 mm, inch로 변환</p>
      <a href="./gauge-converter.html" class="btn">사용하기</a>
    </article>
    <!-- More cards -->
  </section>
</main>
```

---

### B. Utility Tool Page

**특징**:
- 도구 제목 및 설명
- 입력 폼
- 결과 표시 영역
- 사용 예시 (선택)

**구조**:
```html
<main id="main-content" role="main">
  <header>
    <h1>{도구 이름}</h1>
    <p class="lead">{도구 설명}</p>
  </header>

  <article class="tool-container">
    <section class="input-section">
      <h2>입력</h2>
      <form id="tool-form">
        <!-- 입력 필드 -->
      </form>
    </section>

    <section class="result-section" aria-live="polite">
      <h2>결과</h2>
      <div id="result-display">
        <!-- 결과 표시 -->
      </div>
    </section>
  </article>

  <aside class="info-section">
    <h2>사용 예시</h2>
    <!-- 예시 -->
  </aside>
</main>
```

---

### C. Error Page (`404.html`)

**특징**:
- 에러 메시지
- 홈으로 돌아가기 링크
- 유틸리티 목록 (선택)

**구조**:
```html
<main id="main-content" role="main">
  <header class="error-header">
    <h1>404 - 페이지를 찾을 수 없습니다</h1>
    <p>요청하신 페이지가 존재하지 않습니다.</p>
  </header>

  <section class="error-actions">
    <a href="./index.html" class="btn btn-primary">홈으로 돌아가기</a>
  </section>

  <aside class="suggested-pages">
    <h2>다른 페이지 둘러보기</h2>
    <ul>
      <li><a href="./gauge-converter.html">게이지 변환기</a></li>
      <!-- More links -->
    </ul>
  </aside>
</main>
```

---

## 5. Validation Rules

### A. HTML Validation

**필수 검증**:
- W3C HTML Validator 통과
- 시맨틱 HTML 사용
- ARIA 속성 올바르게 사용

**도구**:
- [W3C Validator](https://validator.w3.org/)
- Lighthouse (Chrome DevTools)
- axe DevTools

---

### B. Accessibility Validation

**검증 항목**:
- [ ] WCAG 2.1 AA 준수
- [ ] 키보드 네비게이션 가능
- [ ] 스크린 리더 호환
- [ ] Color contrast ratio 4.5:1 이상
- [ ] Focus indicator 명확

**도구**:
- Playwright accessibility assertions
- axe-core
- NVDA/JAWS 테스트

---

### C. Performance Validation

**검증 항목**:
- [ ] Lighthouse 성능 점수 90+
- [ ] FCP < 1s (desktop), < 3s (mobile)
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] TTI < 2s (desktop), < 5s (mobile)

**도구**:
- Lighthouse
- WebPageTest
- Chrome DevTools Performance

---

## 6. Error Handling Contract

### A. Component Load Failure

**시나리오**: 네비게이션 또는 푸터 컴포넌트 로드 실패

**처리 방법**:
```javascript
try {
  const navHTML = await renderNavigation('page-id');
  document.getElementById('nav-container').innerHTML = navHTML;
} catch (error) {
  console.error('Navigation load failed:', error);
  // Fallback 네비게이션 표시
  document.getElementById('nav-container').innerHTML = `
    <nav class="main-nav">
      <ul>
        <li><a href="./index.html">홈</a></li>
      </ul>
    </nav>
  `;
}
```

---

### B. Menu Data Load Failure

**시나리오**: `menu.json` 로드 실패

**처리 방법**:
- 기본 메뉴 데이터 사용
- 콘솔에 에러 로그
- 사용자에게 알림 (선택)

```javascript
async function loadMenuData() {
  try {
    const response = await fetch('./data/menu.json');
    return await response.json();
  } catch (error) {
    console.error('Menu load failed:', error);
    return {
      items: [
        { id: 'home', label: '홈', path: './index.html' }
      ]
    };
  }
}
```

---

### C. Page-Specific Errors

**시나리오**: 페이지 기능 실행 중 에러

**처리 방법**:
- 사용자에게 명확한 에러 메시지 표시
- 콘솔에 상세 에러 로그
- Graceful degradation (기능 일부만 동작)

```javascript
try {
  const result = calculateGauge(input);
  displayResult(result);
} catch (error) {
  console.error('Calculation failed:', error);
  showError({
    type: 'error',
    message: '계산 중 오류가 발생했습니다. 입력값을 확인해주세요.'
  });
}
```

---

## 7. Testing Contract

### Required Playwright Tests

**각 페이지는 다음 테스트를 통과해야 합니다**:

1. **네비게이션 테스트**:
   - [ ] 네비게이션 메뉴 렌더링
   - [ ] 현재 페이지 활성 표시 (`aria-current="page"`)
   - [ ] 모든 메뉴 링크 클릭 가능

2. **콘텐츠 테스트**:
   - [ ] 메인 제목 (`<h1>`) 존재
   - [ ] 필수 섹션 렌더링
   - [ ] 페이지별 기능 동작

3. **접근성 테스트**:
   - [ ] ARIA 속성 올바르게 설정
   - [ ] 키보드 네비게이션 가능
   - [ ] Color contrast 준수

4. **반응형 테스트**:
   - [ ] 모바일 뷰포트 (< 768px)
   - [ ] 태블릿 뷰포트 (768-1024px)
   - [ ] 데스크톱 뷰포트 (> 1024px)

5. **성능 테스트**:
   - [ ] FCP < 1s
   - [ ] LCP < 2.5s
   - [ ] CLS < 0.1

---

## Summary

### Compliance Checklist

모든 페이지는 다음 항목을 만족해야 합니다:

- [ ] 표준 HTML 구조 준수
- [ ] 필수 메타 태그 포함
- [ ] 시맨틱 HTML 사용
- [ ] 접근성 요구사항 충족 (WCAG 2.1 AA)
- [ ] 공통 컴포넌트 로드 (nav, footer)
- [ ] 성능 목표 달성 (FCP < 1s, LCP < 2.5s)
- [ ] 에러 처리 구현
- [ ] Playwright 테스트 통과

### Enforcement

- 모든 페이지는 코드 리뷰에서 이 계약 준수 여부 검증
- Playwright 테스트 실패 시 커밋 불가
- Lighthouse 성능 점수 90 미만 시 경고
