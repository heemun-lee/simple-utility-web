# Quickstart: SPA to MPA Conversion

**Feature**: 002-spa-to-mpa | **Date**: 2025-10-09

## Overview

이 가이드는 simple-utility-web 프로젝트를 SPA에서 MPA로 전환하는 작업의 빠른 시작 가이드입니다.

---

## Prerequisites

- **Git**: 버전 관리
- **Node.js & npm**: Playwright 테스트 실행용
- **현대 브라우저**: Chrome, Firefox, Safari, 또는 Edge
- **텍스트 에디터**: VS Code 권장

---

## Quick Start

### 1. 프로젝트 구조 이해

**현재 구조 (SPA)**:
```
/
├── index.html          # Single entry point
├── js/
│   ├── router.js       # Client-side router (제거 예정)
│   ├── menu.js
│   └── utils.js
├── pages/              # Dynamic content (전환 예정)
│   ├── home.html
│   └── gauge-converter.html
└── data/
    └── menu.json
```

**목표 구조 (MPA)**:
```
/
├── index.html          # Home page
├── gauge-converter.html # Standalone page
├── js/
│   ├── components/
│   │   ├── nav.js      # Navigation component
│   │   └── footer.js   # Footer component
│   └── utils.js
└── data/
    └── menu.json
```

---

### 2. 핵심 변경 사항

#### A. 페이지 분리
- `/pages/` 디렉토리의 콘텐츠를 루트 레벨 HTML 파일로 이동
- 각 페이지는 완전한 HTML 문서 구조 포함

#### B. 라우터 제거
- `router.js` 삭제
- 모든 페이지 링크를 표준 `<a href="./page.html">` 형태로 변경

#### C. 공통 컴포넌트
- 네비게이션과 푸터를 재사용 가능한 컴포넌트로 분리
- Template literal 기반 렌더링

---

## Implementation Steps

### Step 1: 공통 컴포넌트 생성

**네비게이션 컴포넌트** (`js/components/nav.js`):

```javascript
// js/components/nav.js
export async function renderNavigation(currentPageId) {
  try {
    const response = await fetch('./data/menu.json');
    const menuData = await response.json();

    const navItems = menuData.items
      .sort((a, b) => a.order - b.order)
      .map(item => `
        <li class="nav-item">
          <a href="${item.path}" ${item.id === currentPageId ? 'aria-current="page"' : ''}>
            ${item.icon || ''} ${item.label}
          </a>
        </li>
      `).join('');

    return `
      <nav class="main-nav" role="navigation" aria-label="주요 메뉴">
        <button class="nav-toggle" aria-expanded="false" aria-label="메뉴 열기">
          ☰
        </button>
        <ul class="nav-list">
          ${navItems}
        </ul>
      </nav>
    `;
  } catch (error) {
    console.error('Navigation render failed:', error);
    return `
      <nav class="main-nav">
        <ul class="nav-list">
          <li><a href="./index.html">홈</a></li>
        </ul>
      </nav>
    `;
  }
}
```

**푸터 컴포넌트** (`js/components/footer.js`):

```javascript
// js/components/footer.js
export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="main-footer" role="contentinfo">
      <div class="footer-content">
        <p class="copyright">
          © ${currentYear} Simple Utility Web. All rights reserved.
        </p>
        <nav class="footer-links" aria-label="바닥글 링크">
          <a href="https://github.com/user/repo" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  `;
}
```

---

### Step 2: 페이지 템플릿 생성

**홈 페이지** (`index.html`):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="다양한 유틸리티 도구 모음">
  <title>Simple Utility Web</title>

  <link rel="stylesheet" href="./css/main.css">
  <link rel="stylesheet" href="./css/components.css">
  <link rel="modulepreload" href="./js/components/nav.js">
  <link rel="preload" href="./data/menu.json" as="fetch" crossorigin>
</head>
<body>
  <div id="nav-container"></div>

  <main id="main-content" role="main">
    <header class="hero">
      <h1>Simple Utility Web</h1>
      <p>다양한 유틸리티 도구 모음</p>
    </header>

    <section class="utilities-grid">
      <!-- 유틸리티 카드들 -->
    </section>
  </main>

  <div id="footer-container"></div>

  <script type="module">
    import { renderNavigation } from './js/components/nav.js';
    import { renderFooter } from './js/components/footer.js';

    document.getElementById('nav-container').innerHTML = await renderNavigation('home');
    document.getElementById('footer-container').innerHTML = renderFooter();
  </script>
</body>
</html>
```

**유틸리티 페이지** (예: `gauge-converter.html`):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AWG, SWG, BWG 게이지를 mm, inch 단위로 변환하는 도구">
  <title>게이지 변환기 - Simple Utility Web</title>

  <link rel="stylesheet" href="./css/main.css">
  <link rel="stylesheet" href="./css/components.css">
</head>
<body>
  <div id="nav-container"></div>

  <main id="main-content" role="main">
    <header>
      <h1>게이지 변환기</h1>
      <p class="lead">AWG, SWG, BWG 게이지를 mm, inch 단위로 변환합니다.</p>
    </header>

    <article class="tool-container">
      <!-- 도구 UI -->
    </article>
  </main>

  <div id="footer-container"></div>

  <script type="module">
    import { renderNavigation } from './js/components/nav.js';
    import { renderFooter } from './js/components/footer.js';

    document.getElementById('nav-container').innerHTML = await renderNavigation('gauge-converter');
    document.getElementById('footer-container').innerHTML = renderFooter();
  </script>

  <script type="module" src="./js/gauge-converter.js"></script>
</body>
</html>
```

---

### Step 3: CSS 구조 정리

**공통 스타일** (`css/components.css`):

```css
/* Navigation */
.main-nav {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--nav-bg);
}

.nav-toggle {
  display: none; /* 모바일에서만 표시 */
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.nav-list {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item a {
  text-decoration: none;
  color: var(--nav-link-color);
  padding: 0.5rem 1rem;
}

.nav-item a[aria-current="page"] {
  font-weight: bold;
  border-bottom: 2px solid var(--nav-active-color);
}

/* Mobile */
@media (max-width: 768px) {
  .nav-toggle {
    display: block;
  }

  .nav-list {
    display: none;
    flex-direction: column;
    width: 100%;
  }

  .nav-list.active {
    display: flex;
  }
}

/* Footer */
.main-footer {
  padding: 2rem 1rem;
  background: var(--footer-bg);
  text-align: center;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}
```

---

### Step 4: 메뉴 데이터 업데이트

**메뉴 JSON** (`data/menu.json`):

```json
{
  "version": "2.0",
  "items": [
    {
      "id": "home",
      "label": "홈",
      "path": "./index.html",
      "category": "main",
      "order": 1,
      "icon": "🏠"
    },
    {
      "id": "gauge-converter",
      "label": "게이지 변환",
      "path": "./gauge-converter.html",
      "category": "converter",
      "order": 10,
      "icon": "🔧"
    }
  ],
  "categories": [
    {
      "id": "main",
      "label": "메인",
      "order": 1
    },
    {
      "id": "converter",
      "label": "변환 도구",
      "order": 2
    }
  ]
}
```

---

### Step 5: 라우터 제거

1. **`router.js` 삭제**:
   ```bash
   rm js/router.js
   ```

2. **`index.html`에서 라우터 참조 제거**:
   - `<script src="./js/router.js">` 삭제
   - 동적 콘텐츠 로딩 로직 제거

3. **페이지 링크 변경**:
   - 기존: `<a href="#/gauge-converter">`
   - 변경: `<a href="./gauge-converter.html">`

---

### Step 6: 테스트 작성

**네비게이션 테스트** (`tests/e2e/navigation.spec.js`):

```javascript
import { test, expect } from '@playwright/test';

test('홈에서 게이지 변환기로 이동', async ({ page }) => {
  await page.goto('/');

  // 네비게이션 메뉴 확인
  await expect(page.locator('nav.main-nav')).toBeVisible();

  // 게이지 변환기 링크 클릭
  await page.click('a[href="./gauge-converter.html"]');

  // URL 검증
  await expect(page).toHaveURL(/gauge-converter\.html$/);

  // 페이지 제목 검증
  await expect(page.locator('h1')).toContainText('게이지 변환');

  // 현재 페이지 활성 표시 검증
  await expect(page.locator('a[aria-current="page"]')).toHaveText(/게이지 변환/);
});

test('모든 페이지에서 네비게이션 표시', async ({ page }) => {
  const pages = [
    '/',
    '/gauge-converter.html'
  ];

  for (const pagePath of pages) {
    await page.goto(pagePath);
    await expect(page.locator('nav.main-nav')).toBeVisible();
    await expect(page.locator('footer.main-footer')).toBeVisible();
  }
});
```

---

### Step 7: 실행 및 검증

**로컬 서버 실행**:
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000
```

**테스트 실행**:
```bash
npm run test:playwright
```

**수동 검증**:
1. `http://localhost:8000` 접속
2. 네비게이션 메뉴에서 각 페이지 이동
3. 브라우저 뒤로가기/앞으로가기 동작 확인
4. 모바일 뷰 (DevTools) 확인

---

## Troubleshooting

### 문제: 네비게이션 메뉴가 표시되지 않음

**원인**: `menu.json` 로드 실패 또는 경로 문제

**해결**:
1. 브라우저 콘솔에서 에러 확인
2. `menu.json` 경로가 올바른지 확인 (`./data/menu.json`)
3. CORS 문제인 경우 로컬 서버 사용

---

### 문제: 페이지 간 이동 시 404 에러

**원인**: GitHub Pages 배포 시 상대 경로 문제

**해결**:
1. 모든 경로를 상대 경로로 변경 (`./` 접두사)
2. `.nojekyll` 파일 생성
3. GitHub Pages 설정 확인

---

### 문제: 모바일 메뉴 토글이 동작하지 않음

**원인**: 토글 이벤트 리스너 미구현

**해결**:
```javascript
// nav.js에 추가
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  const navList = document.querySelector('.nav-list');
  const toggle = document.querySelector('.nav-toggle');
  navList.classList.toggle('active');
  const isExpanded = navList.classList.contains('active');
  toggle.setAttribute('aria-expanded', isExpanded);
});
```

---

## Performance Checklist

완료 후 다음 항목을 확인하세요:

- [ ] Lighthouse 성능 점수 90+
- [ ] FCP < 1s (desktop), < 3s (mobile)
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] 모든 Playwright 테스트 통과
- [ ] WCAG 2.1 AA 준수
- [ ] 크로스 브라우저 테스트 완료

---

## Next Steps

1. **추가 페이지 마이그레이션**: `/pages/` 디렉토리의 모든 페이지 변환
2. **404 페이지 생성**: `404.html` 추가
3. **성능 최적화**: Preload, lazy loading 적용
4. **CI/CD 설정**: GitHub Actions로 자동 테스트 및 배포

---

## Resources

- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [Component Interfaces Contract](./contracts/component-interfaces.md)
- [Page Structure Contract](./contracts/page-structure.md)
- [Research Document](./research.md)

---

## Support

문제가 발생하면:
1. GitHub Issues에 문제 등록
2. `specs/002-spa-to-mpa/` 문서 참조
3. Playwright 테스트 로그 확인
