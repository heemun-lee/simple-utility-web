# Data Model: SPA to MPA Conversion

**Feature**: 002-spa-to-mpa | **Date**: 2025-10-09

## Overview

MPA 구조에서는 전통적인 의미의 "데이터 모델"보다는 **페이지 구조**, **컴포넌트 인터페이스**, **메뉴 데이터** 스키마가 중요합니다.

---

## 1. Page Structure Model

### Entity: `Page`

각 독립 HTML 페이지의 구조를 정의합니다.

**Attributes**:
- `id` (string): 페이지 고유 식별자 (파일명 기반, 예: `gauge-converter`)
- `title` (string): 페이지 제목 (예: "게이지 변환기")
- `description` (string): 메타 설명 (SEO용)
- `path` (string): HTML 파일 경로 (예: `./gauge-converter.html`)
- `category` (string): 페이지 카테고리 (예: "converter", "calculator", "tool")
- `keywords` (string[]): SEO 키워드

**Structure Template**:
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{description}">
  <meta name="keywords" content="{keywords.join(', ')}">
  <title>{title} - Simple Utility Web</title>

  <!-- Common Styles -->
  <link rel="stylesheet" href="./css/main.css">
  <link rel="stylesheet" href="./css/components.css">

  <!-- Page-specific Styles (optional) -->
  <link rel="stylesheet" href="./css/{id}.css">
</head>
<body>
  <!-- Navigation Container -->
  <div id="nav-container"></div>

  <!-- Main Content -->
  <main id="main-content" role="main">
    <h1>{title}</h1>
    <!-- Page-specific content -->
  </main>

  <!-- Footer Container -->
  <div id="footer-container"></div>

  <!-- Common Scripts -->
  <script type="module">
    import { renderNavigation } from './js/components/nav.js';
    import { renderFooter } from './js/components/footer.js';

    document.getElementById('nav-container').innerHTML = renderNavigation('{id}');
    document.getElementById('footer-container').innerHTML = renderFooter();
  </script>

  <!-- Page-specific Scripts -->
  <script type="module" src="./js/{id}.js"></script>
</body>
</html>
```

**Validation Rules**:
- `id`는 kebab-case, 영문+숫자+하이픈만 허용
- `path`는 상대 경로 형식 (`./`로 시작)
- `title`은 필수, 1-60자
- `description`은 선택, 최대 160자 (SEO 최적 길이)

---

## 2. Navigation Menu Model

### Entity: `MenuItem`

네비게이션 메뉴 항목 데이터 구조입니다.

**Attributes**:
- `id` (string): 메뉴 항목 고유 ID
- `label` (string): 메뉴에 표시될 텍스트
- `path` (string): 링크 경로
- `category` (string): 메뉴 카테고리 (그룹화용)
- `order` (number): 표시 순서
- `icon` (string, optional): 아이콘 클래스 또는 이모지

**JSON Schema** (`data/menu.json`):
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
    },
    {
      "id": "calculator",
      "label": "계산 도구",
      "order": 3
    }
  ]
}
```

**Validation Rules**:
- `items` 배열은 `order` 기준 정렬
- `path`는 상대 경로 형식
- `category`는 `categories` 배열에 정의된 값만 허용
- `label`은 1-20자 제한

**Relationships**:
- `MenuItem.category` → `Category.id` (Many-to-One)

---

## 3. Component Interface Model

### A. Navigation Component

**Interface**: `renderNavigation(currentPageId: string): string`

**Input**:
- `currentPageId` (string): 현재 페이지 ID (활성 표시용)

**Output**:
- HTML 문자열 (네비게이션 마크업)

**Contract**:
```typescript
interface NavigationProps {
  currentPageId: string;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  category: string;
  order: number;
  icon?: string;
}

function renderNavigation(currentPageId: string): string {
  // 1. menu.json 로드
  // 2. 카테고리별 그룹화
  // 3. 현재 페이지 활성화 (aria-current="page")
  // 4. HTML 문자열 반환
}
```

**Accessibility Requirements**:
- `<nav role="navigation">` 사용
- 현재 페이지: `aria-current="page"` 속성
- 키보드 네비게이션 지원 (Tab, Enter)
- 모바일: 햄버거 메뉴 (`aria-expanded` 속성)

---

### B. Footer Component

**Interface**: `renderFooter(): string`

**Output**:
- HTML 문자열 (푸터 마크업)

**Contract**:
```typescript
function renderFooter(): string {
  // 1. 저작권 정보
  // 2. 프로젝트 링크 (GitHub 등)
  // 3. 라이선스 정보
}
```

---

## 4. Page State Model (Optional)

### Entity: `PageState`

일부 페이지에서 사용자 입력 상태를 유지할 필요가 있습니다.

**Storage**: `localStorage` 또는 URL 파라미터

**Attributes**:
- `pageId` (string): 페이지 ID
- `formData` (object): 폼 입력 데이터
- `preferences` (object): 사용자 설정

**Example** (게이지 변환기):
```javascript
// 상태 저장
const state = {
  pageId: 'gauge-converter',
  formData: {
    gauge: '18',
    standard: 'awg',
    unit: 'mm'
  },
  preferences: {
    defaultStandard: 'awg',
    defaultUnit: 'mm'
  }
};

localStorage.setItem('gauge-converter-state', JSON.stringify(state));

// 상태 복원
const savedState = JSON.parse(localStorage.getItem('gauge-converter-state'));
if (savedState) {
  document.getElementById('gauge').value = savedState.formData.gauge;
  document.getElementById('standard').value = savedState.formData.standard;
}
```

**Validation Rules**:
- localStorage 용량 제한 (5-10MB)
- JSON 직렬화 가능한 데이터만 저장
- 민감 정보는 저장하지 않음

---

## 5. URL Parameter Model

### Entity: `URLParams`

페이지 간 컨텍스트 전달을 위한 URL 파라미터 구조입니다.

**Common Parameters**:
- `ref` (string): 유입 경로 추적 (analytics용)
- `lang` (string): 언어 설정 (향후 다국어 지원용)

**Page-Specific Parameters** (게이지 변환기 예시):
- `unit` (string): 게이지 단위 (awg, swg, bwg 등)
- `value` (string): 게이지 값
- `convert` (string): 변환할 단위 (mm, inch 등)

**Example URL**:
```
./gauge-converter.html?unit=awg&value=18&convert=mm
```

**Parsing Logic**:
```javascript
const params = new URLSearchParams(window.location.search);
const unit = params.get('unit') || 'awg';
const value = params.get('value') || '';
const convert = params.get('convert') || 'mm';
```

**Validation Rules**:
- 파라미터는 선택 사항, 기본값 제공
- 값 검증 필수 (XSS 방지)
- 알 수 없는 파라미터는 무시

---

## 6. Error Handling Model

### Entity: `ErrorState`

페이지 로드 실패, 데이터 오류 등을 처리합니다.

**Error Types**:
- `MENU_LOAD_FAILED`: menu.json 로드 실패
- `INVALID_PAGE_PARAM`: 잘못된 URL 파라미터
- `COMPONENT_RENDER_FAILED`: 컴포넌트 렌더링 실패

**Error Structure**:
```javascript
const error = {
  type: 'MENU_LOAD_FAILED',
  message: '메뉴 데이터를 불러올 수 없습니다.',
  timestamp: Date.now(),
  context: {
    url: './data/menu.json',
    status: 404
  }
};
```

**Error Handling Strategy**:
1. 콘솔에 에러 로그 출력
2. 사용자에게 친화적인 메시지 표시
3. Fallback UI 제공 (예: 기본 네비게이션 링크)

---

## Summary

### Core Entities
1. **Page**: 독립 HTML 페이지 구조
2. **MenuItem**: 네비게이션 메뉴 데이터
3. **Component Interface**: 공통 컴포넌트 (Nav, Footer)
4. **PageState**: 페이지별 상태 (optional)
5. **URLParams**: 페이지 간 컨텍스트 전달
6. **ErrorState**: 에러 처리

### Key Relationships
- MenuItem → Category (Many-to-One)
- Page → MenuItem (One-to-One, 메뉴 항목과 매핑)

### State Transitions
```
[페이지 로드] → [menu.json 로드] → [컴포넌트 렌더링] → [페이지 초기화]
                     ↓ (실패)
                [에러 처리] → [Fallback UI 표시]
```

### Validation Summary
- 모든 경로는 상대 경로 형식
- ID는 kebab-case
- 사용자 입력은 검증 및 이스케이프
- 에러 발생 시 Graceful degradation
