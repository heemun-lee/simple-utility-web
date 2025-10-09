# Component Interfaces Contract

**Feature**: 002-spa-to-mpa | **Date**: 2025-10-09

## Overview

MPA 구조에서 사용되는 공통 컴포넌트의 인터페이스를 정의합니다. 모든 컴포넌트는 순수 함수로 구현되며, HTML 문자열을 반환합니다.

---

## 1. Navigation Component

### `renderNavigation(currentPageId: string): Promise<string>`

**Purpose**: 전체 페이지에서 공통으로 사용되는 네비게이션 메뉴를 렌더링합니다.

**Input**:
```typescript
interface NavigationInput {
  currentPageId: string;  // 현재 페이지 ID (활성 표시용)
}
```

**Output**:
```typescript
type NavigationOutput = string;  // HTML 문자열
```

**HTML Structure**:
```html
<nav class="main-nav" role="navigation" aria-label="주요 메뉴">
  <button class="nav-toggle" aria-expanded="false" aria-label="메뉴 열기">
    ☰
  </button>
  <ul class="nav-list">
    <li class="nav-item">
      <a href="./index.html" aria-current="page">홈</a>
    </li>
    <li class="nav-item">
      <a href="./gauge-converter.html">게이지 변환</a>
    </li>
    <!-- More items -->
  </ul>
</nav>
```

**Behavior**:
1. `data/menu.json`에서 메뉴 데이터 로드
2. 카테고리별로 메뉴 항목 그룹화
3. `currentPageId`와 일치하는 항목에 `aria-current="page"` 속성 추가
4. 모바일: 햄버거 메뉴 토글 버튼 포함

**Error Handling**:
- `menu.json` 로드 실패 시: 기본 네비게이션 링크 반환
- 잘못된 `currentPageId`: 활성 표시 없이 전체 메뉴 반환

**CSS Classes**:
- `.main-nav`: 네비게이션 컨테이너
- `.nav-toggle`: 모바일 메뉴 토글 버튼
- `.nav-list`: 메뉴 항목 리스트
- `.nav-item`: 개별 메뉴 항목
- `.nav-item.active`: 활성 메뉴 항목 (currentPageId와 일치)

**Accessibility**:
- `role="navigation"` 명시
- `aria-label="주요 메뉴"` 제공
- `aria-current="page"` 현재 페이지 표시
- `aria-expanded` 모바일 메뉴 상태 표시
- 키보드 네비게이션 지원 (Tab, Enter, Escape)

**Example Usage**:
```javascript
import { renderNavigation } from './js/components/nav.js';

const navHTML = await renderNavigation('gauge-converter');
document.getElementById('nav-container').innerHTML = navHTML;
```

**Test Cases**:
1. ✅ 메뉴 데이터 정상 로드 및 렌더링
2. ✅ `currentPageId`와 일치하는 항목에 `aria-current="page"` 속성
3. ✅ `menu.json` 로드 실패 시 기본 메뉴 반환
4. ✅ 모바일: 햄버거 메뉴 토글 동작
5. ✅ 키보드로 모든 메뉴 항목 접근 가능

---

## 2. Footer Component

### `renderFooter(): string`

**Purpose**: 전체 페이지에서 공통으로 사용되는 푸터를 렌더링합니다.

**Input**: 없음

**Output**:
```typescript
type FooterOutput = string;  // HTML 문자열
```

**HTML Structure**:
```html
<footer class="main-footer" role="contentinfo">
  <div class="footer-content">
    <p class="copyright">
      © 2025 Simple Utility Web. All rights reserved.
    </p>
    <nav class="footer-links" aria-label="바닥글 링크">
      <a href="https://github.com/user/repo" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
      <a href="./about.html">About</a>
      <a href="./privacy.html">Privacy</a>
    </nav>
  </div>
</footer>
```

**Behavior**:
1. 저작권 정보 표시 (현재 연도 자동 계산)
2. 프로젝트 링크 (GitHub, About, Privacy 등)
3. 외부 링크는 `target="_blank"` + `rel="noopener noreferrer"` 적용

**CSS Classes**:
- `.main-footer`: 푸터 컨테이너
- `.footer-content`: 푸터 내용 래퍼
- `.copyright`: 저작권 텍스트
- `.footer-links`: 푸터 링크 네비게이션

**Accessibility**:
- `role="contentinfo"` 명시
- 푸터 링크에 `aria-label="바닥글 링크"` 제공
- 외부 링크 보안 속성 (`rel="noopener noreferrer"`)

**Example Usage**:
```javascript
import { renderFooter } from './js/components/footer.js';

const footerHTML = renderFooter();
document.getElementById('footer-container').innerHTML = footerHTML;
```

**Test Cases**:
1. ✅ 현재 연도가 저작권 정보에 표시
2. ✅ 외부 링크에 보안 속성 포함
3. ✅ 모든 링크 접근 가능

---

## 3. Page Metadata Component

### `setPageMetadata(metadata: PageMetadata): void`

**Purpose**: 페이지별 메타데이터(제목, 설명, 키워드)를 동적으로 설정합니다.

**Input**:
```typescript
interface PageMetadata {
  title: string;           // 페이지 제목 (1-60자)
  description?: string;    // 메타 설명 (최대 160자)
  keywords?: string[];     // SEO 키워드
  ogImage?: string;        // Open Graph 이미지 (optional)
}
```

**Output**: 없음 (DOM 직접 수정)

**Behavior**:
1. `<title>` 태그 업데이트
2. `<meta name="description">` 업데이트
3. `<meta name="keywords">` 업데이트 (있는 경우)
4. Open Graph 메타 태그 추가 (있는 경우)

**Example Usage**:
```javascript
import { setPageMetadata } from './js/components/metadata.js';

setPageMetadata({
  title: '게이지 변환기',
  description: 'AWG, SWG, BWG 게이지를 mm, inch 단위로 변환하는 도구입니다.',
  keywords: ['게이지', '변환기', 'awg', 'swg', 'mm', 'inch'],
  ogImage: './images/gauge-converter-og.png'
});
```

**Test Cases**:
1. ✅ `<title>` 태그 정확히 업데이트
2. ✅ 메타 설명 160자 제한 검증
3. ✅ Open Graph 메타 태그 올바르게 추가

---

## 4. Menu Loader Utility

### `loadMenuData(): Promise<MenuData>`

**Purpose**: `data/menu.json`에서 메뉴 데이터를 로드하고 파싱합니다.

**Input**: 없음

**Output**:
```typescript
interface MenuItem {
  id: string;
  label: string;
  path: string;
  category: string;
  order: number;
  icon?: string;
}

interface Category {
  id: string;
  label: string;
  order: number;
}

interface MenuData {
  version: string;
  items: MenuItem[];
  categories: Category[];
}
```

**Behavior**:
1. `fetch('./data/menu.json')` 호출
2. JSON 파싱 및 검증
3. `order` 기준 정렬
4. 캐싱 (동일 세션 내 재사용)

**Error Handling**:
- Fetch 실패: 기본 메뉴 데이터 반환
- JSON 파싱 오류: 콘솔 에러 로그 + 기본 데이터 반환
- 검증 실패: 유효한 항목만 반환

**Caching Strategy**:
```javascript
let cachedMenuData = null;

async function loadMenuData() {
  if (cachedMenuData) {
    return cachedMenuData;
  }

  try {
    const response = await fetch('./data/menu.json');
    const data = await response.json();
    cachedMenuData = data;
    return data;
  } catch (error) {
    console.error('Menu load failed:', error);
    return getDefaultMenuData();
  }
}
```

**Test Cases**:
1. ✅ 정상 데이터 로드 및 파싱
2. ✅ 캐싱 동작 (두 번째 호출 시 fetch 없음)
3. ✅ Fetch 실패 시 기본 데이터 반환
4. ✅ JSON 파싱 오류 시 기본 데이터 반환

---

## 5. Error Display Component

### `showError(error: ErrorInfo): void`

**Purpose**: 사용자에게 에러 메시지를 표시합니다.

**Input**:
```typescript
interface ErrorInfo {
  type: 'warning' | 'error' | 'info';
  message: string;
  duration?: number;  // ms, default: 5000
}
```

**Output**: 없음 (DOM에 에러 UI 삽입)

**HTML Structure**:
```html
<div class="error-toast error-toast--error" role="alert" aria-live="assertive">
  <p class="error-message">메뉴 데이터를 불러올 수 없습니다.</p>
  <button class="error-close" aria-label="닫기">×</button>
</div>
```

**Behavior**:
1. 에러 토스트 UI 생성 및 삽입
2. `duration` 후 자동 제거 (기본 5초)
3. 닫기 버튼 클릭 시 즉시 제거
4. 애니메이션 (fade-in, fade-out)

**CSS Classes**:
- `.error-toast`: 토스트 컨테이너
- `.error-toast--warning`: 경고 스타일
- `.error-toast--error`: 에러 스타일
- `.error-toast--info`: 정보 스타일
- `.error-message`: 메시지 텍스트
- `.error-close`: 닫기 버튼

**Accessibility**:
- `role="alert"` 명시
- `aria-live="assertive"` (즉시 알림)
- 닫기 버튼에 `aria-label="닫기"` 제공

**Example Usage**:
```javascript
import { showError } from './js/components/error.js';

showError({
  type: 'error',
  message: '메뉴 데이터를 불러올 수 없습니다.',
  duration: 5000
});
```

**Test Cases**:
1. ✅ 에러 메시지 정확히 표시
2. ✅ `duration` 후 자동 제거
3. ✅ 닫기 버튼 클릭 시 즉시 제거
4. ✅ 스크린 리더에서 즉시 알림

---

## Integration Contract

### Component Loading Sequence

모든 페이지는 다음 순서로 컴포넌트를 로드합니다:

```javascript
// 1. 메뉴 데이터 로드 (병렬 가능)
const menuDataPromise = loadMenuData();

// 2. 네비게이션 렌더링
const navHTML = await renderNavigation('current-page-id');
document.getElementById('nav-container').innerHTML = navHTML;

// 3. 푸터 렌더링 (병렬 가능)
const footerHTML = renderFooter();
document.getElementById('footer-container').innerHTML = footerHTML;

// 4. 페이지별 초기화
initializePage();

// 5. 에러 처리
try {
  // ...
} catch (error) {
  showError({
    type: 'error',
    message: error.message
  });
}
```

### Performance Contract

- 네비게이션 렌더링: < 50ms
- 푸터 렌더링: < 10ms
- 메뉴 데이터 로드 (첫 요청): < 200ms
- 메뉴 데이터 로드 (캐시): < 1ms

### Compatibility Contract

- ES6+ 모듈 (`import`/`export`) 사용
- `async`/`await` 문법 사용
- `fetch` API 사용
- 현대 브라우저 지원 (Chrome, Firefox, Safari, Edge)

---

## Test Coverage Requirements

각 컴포넌트는 다음 항목을 Playwright로 검증해야 합니다:

1. **렌더링 정확성**: 예상 HTML 구조 생성
2. **접근성**: ARIA 속성, 키보드 네비게이션
3. **에러 처리**: 데이터 로드 실패 시나리오
4. **반응형**: 모바일/데스크톱 환경
5. **성능**: 렌더링 시간 측정

**최소 커버리지**: 각 컴포넌트 80% 이상
