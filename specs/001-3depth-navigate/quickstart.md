# Quickstart Guide: 3-Depth Navigation with Gauge Converter

**Feature**: 001-3depth-navigate
**Date**: 2025-10-08
**Target Audience**: 개발자

## 📋 Prerequisites

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 텍스트 에디터 또는 IDE
- 로컬 웹 서버 (Python, Node.js http-server 등)
- Playwright 설치 (테스트용)

```bash
# Playwright 설치
npm init -y
npm install -D @playwright/test
npx playwright install
```

## 🚀 Quick Start (5분)

### 1. 프로젝트 구조 생성

```bash
# 프로젝트 루트에서 실행
mkdir -p css/knitting-tools/gauge-tools
mkdir -p js/knitting-tools/gauge-tools
mkdir -p pages/knitting-tools/gauge-tools
mkdir -p data
mkdir -p tests/{e2e,visual,accessibility}/knitting-tools/gauge-tools

# 필수 파일 생성
touch index.html .nojekyll

# 공통 CSS/JS (루트)
touch css/{main.css,menu.css,mobile.css}
touch js/{utils.js,router.js,menu.js}

# 기능별 CSS/JS (depth 구조)
touch css/knitting-tools/gauge-tools/gauge-converter.css
touch js/knitting-tools/gauge-tools/{validator.js,gauge-converter.js}

# 메뉴 데이터
touch data/menu.json

# 페이지 (depth 구조)
touch pages/home.html
touch pages/knitting-tools/gauge-tools/gauge-converter.html
```

### 2. 최소 기능 구현 (index.html)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple Utility Web</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/menu.css">
  <link rel="stylesheet" href="css/mobile.css">
</head>
<body>
  <nav id="menu-container"></nav>
  <main id="content"></main>

  <script type="module" src="js/utils.js"></script>
  <script type="module" src="js/router.js"></script>
  <script type="module" src="js/menu.js"></script>
</body>
</html>
```

### 3. 메뉴 JSON 정의 (data/menu.json)

```json
{
  "menu": [
    {
      "id": "knitting-tools",
      "title": "편물 도구",
      "children": [
        {
          "id": "gauge-tools",
          "title": "게이지 관련",
          "children": [
            {
              "id": "gauge-converter",
              "title": "게이지 변환 계산기",
              "url": "/pages/knitting-tools/gauge-tools/gauge-converter.html"
            }
          ]
        }
      ]
    }
  ]
}
```

### 4. SPA 라우터 구현 (js/router.js)

```javascript
const pageCache = new Map();

export const navigateTo = async (url) => {
  history.pushState(null, null, url);
  await loadPage(url);
};

const loadPage = async (url) => {
  if (pageCache.has(url)) {
    document.getElementById('content').innerHTML = pageCache.get(url);
    return;
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    pageCache.set(url, html);
    document.getElementById('content').innerHTML = html;
  } catch (error) {
    document.getElementById('content').innerHTML = '<h1>404 Not Found</h1>';
  }
};

window.addEventListener('popstate', () => loadPage(location.pathname));
```

### 5. 메뉴 렌더링 (js/menu.js)

```javascript
import { navigateTo } from './router.js';

const renderMenu = (items, depth = 0) => {
  const ul = document.createElement('ul');
  ul.className = `menu-depth-${depth}`;

  items.forEach(item => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = item.title;

    if (item.url) {
      button.addEventListener('click', () => navigateTo(item.url));
    } else if (item.children) {
      button.addEventListener('click', () => toggleSubmenu(button));
      const submenu = renderMenu(item.children, depth + 1);
      li.appendChild(button);
      li.appendChild(submenu);
    }

    li.appendChild(button);
    ul.appendChild(li);
  });

  return ul;
};

const loadMenu = async () => {
  const response = await fetch('/data/menu.json');
  const data = await response.json();
  const menuContainer = document.getElementById('menu-container');
  menuContainer.appendChild(renderMenu(data.menu));
};

loadMenu();
```

### 6. 게이지 변환 페이지 (pages/knitting-tools/gauge-tools/gauge-converter.html)

```html
<article>
  <h1>게이지 변환 계산기</h1>

  <section>
    <h2>기준 게이지</h2>
    <input type="number" id="base-stitches" placeholder="코수" min="1">
    <input type="number" id="base-rows" placeholder="단수" min="1">
  </section>

  <section>
    <h2>실제 게이지</h2>
    <input type="number" id="actual-stitches" placeholder="코수" min="1">
    <input type="number" id="actual-rows" placeholder="단수" min="1">
  </section>

  <section>
    <h2>변환할 값</h2>
    <input type="number" id="input-stitches" placeholder="코수 (선택)">
    <input type="number" id="input-rows" placeholder="단수 (선택)">
  </section>

  <button id="calculate">계산</button>

  <section id="result">
    <p>결과: <span id="result-stitches"></span> 코, <span id="result-rows"></span> 단</p>
  </section>
</article>

<script type="module">
  import { convertGauge } from '/js/knitting-tools/gauge-tools/validator.js';

  document.getElementById('calculate').addEventListener('click', () => {
    const baseStitches = Number(document.getElementById('base-stitches').value);
    const baseRows = Number(document.getElementById('base-rows').value);
    const actualStitches = Number(document.getElementById('actual-stitches').value);
    const actualRows = Number(document.getElementById('actual-rows').value);
    const inputStitches = Number(document.getElementById('input-stitches').value);
    const inputRows = Number(document.getElementById('input-rows').value);

    const resultStitches = inputStitches ? convertGauge(inputStitches, baseStitches, actualStitches) : '';
    const resultRows = inputRows ? convertGauge(inputRows, baseRows, actualRows) : '';

    document.getElementById('result-stitches').textContent = resultStitches;
    document.getElementById('result-rows').textContent = resultRows;
  });
</script>
```

### 7. 게이지 변환 로직 (js/knitting-tools/gauge-tools/validator.js)

```javascript
export const convertGauge = (input, base, actual) => {
  if (actual === 0) throw new Error('실제 게이지는 0이 될 수 없습니다');
  return +(input * (actual / base)).toFixed(2);
};

export const validateGauge = (value) => {
  if (value <= 0 || value > 1000) {
    return { valid: false, error: '0~1000 사이 값을 입력하세요' };
  }
  return { valid: true };
};
```

## 🧪 Testing Setup

### Playwright Configuration (playwright.config.js)

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Test (tests/e2e/knitting-tools/gauge-tools/gauge-converter.spec.js)

```javascript
import { test, expect } from '@playwright/test';

test('게이지 변환 계산', async ({ page }) => {
  await page.goto('/');

  // 메뉴 네비게이션
  await page.click('text=편물 도구');
  await page.click('text=게이지 관련');
  await page.click('text=게이지 변환 계산기');

  // 게이지 입력
  await page.fill('#base-stitches', '25');
  await page.fill('#base-rows', '30');
  await page.fill('#actual-stitches', '20');
  await page.fill('#actual-rows', '25');
  await page.fill('#input-rows', '100');

  // 계산
  await page.click('#calculate');

  // 결과 검증
  await expect(page.locator('#result-rows')).toHaveText('83.33');
});
```

## 🚀 Running Locally

### Start Local Server

```bash
# Python (권장)
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

브라우저에서 `http://localhost:8000` 접속

### Run Playwright Tests

```bash
# 모든 브라우저에서 테스트 실행
npx playwright test

# 특정 브라우저만
npx playwright test --project=chromium

# UI 모드로 실행
npx playwright test --ui

# 디버그 모드
npx playwright test --debug
```

## 📦 Deployment (GitHub Pages)

### 1. .nojekyll 파일 생성
```bash
touch .nojekyll
```

### 2. GitHub Pages 설정
1. GitHub 저장소 → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, / (root)
4. Save

### 3. Push to GitHub
```bash
git add .
git commit -m "feat: add 3-depth navigation and gauge converter"
git push origin main
```

### 4. 배포 확인
- URL: `https://<username>.github.io/<repository>/`
- 배포 상태: Actions 탭에서 확인

## ✅ Validation Checklist

- [ ] 로컬 서버에서 index.html 로드 확인
- [ ] 메뉴가 3depth 구조로 렌더링되는지 확인
- [ ] 게이지 변환 계산이 정확한지 확인 (테스트 케이스: 25→20, 30→25, 100단 → 83.33단)
- [ ] 브라우저 뒤로가기/앞으로가기 작동 확인
- [ ] 모바일 반응형 레이아웃 확인 (DevTools 375px)
- [ ] Playwright E2E 테스트 통과 확인
- [ ] GitHub Pages 배포 성공 확인

## 🔧 Troubleshooting

### 문제: 메뉴가 렌더링되지 않음
**해결**: menu.json이 올바른 경로에 있는지, CORS 오류가 있는지 확인 (로컬 서버 필요)

### 문제: 페이지 전환이 작동하지 않음
**해결**: JavaScript 모듈 로드 확인 (`type="module"`), History API 지원 브라우저 확인

### 문제: Playwright 테스트 실패
**해결**: 로컬 서버가 실행 중인지 확인, `baseURL` 설정 확인

### 문제: GitHub Pages에서 404 오류
**해결**: `.nojekyll` 파일 존재 확인, 상대 경로 사용 확인

## 📚 Next Steps

1. **스타일링**: CSS 파일 작성 (main.css, menu.css, mobile.css)
2. **추가 기능**: 더 많은 유틸리티 페이지 추가
3. **접근성**: ARIA 속성, 키보드 네비게이션 구현
4. **성능 최적화**: Critical CSS 인라인, 리소스 preload
5. **테스트 확장**: Visual regression, Accessibility 테스트 추가

## 🔗 References

- [spec.md](./spec.md) - 기능 명세
- [data-model.md](./data-model.md) - 데이터 구조
- [research.md](./research.md) - 기술 조사
- [contracts/menu-structure.json](./contracts/menu-structure.json) - 메뉴 JSON 스키마
