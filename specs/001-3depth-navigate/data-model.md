# Data Model: 3-Depth Navigation with Gauge Converter

**Feature**: 001-3depth-navigate
**Date**: 2025-10-08
**Purpose**: 데이터 구조 및 엔티티 정의

## 1. Gauge (게이지)

편물의 밀도를 나타내는 측정 단위.

### Attributes
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| width | Number | Yes | > 0, ≤ 100 | 측정 가로 크기 (cm) |
| height | Number | Yes | > 0, ≤ 100 | 측정 세로 크기 (cm) |
| stitches | Number | Yes | > 0, ≤ 1000 | 코수 (가로 방향) |
| rows | Number | Yes | > 0, ≤ 1000 | 단수 (세로 방향) |

### Subtypes

#### BaseGauge (기준 게이지)
패턴이나 도안에서 제시하는 표준 게이지.

**Example**:
```json
{
  "width": 10,
  "height": 10,
  "stitches": 25,
  "rows": 30
}
```

#### ActualGauge (실제 게이지)
사용자가 실제로 뜨개질한 결과의 게이지.

**Example**:
```json
{
  "width": 10,
  "height": 10,
  "stitches": 20,
  "rows": 25
}
```

### Relationships
- BaseGauge와 ActualGauge는 1:1 관계로 변환 계산에 사용됨
- ConversionInput은 BaseGauge와 ActualGauge를 참조함

### State Transitions
N/A (상태 없는 불변 데이터)

### Validation Rules
```javascript
const validateGauge = (gauge) => {
  const { width, height, stitches, rows } = gauge;

  if (width <= 0 || width > 100) {
    return { valid: false, error: '가로 크기는 0~100cm 사이여야 합니다' };
  }
  if (height <= 0 || height > 100) {
    return { valid: false, error: '세로 크기는 0~100cm 사이여야 합니다' };
  }
  if (stitches <= 0 || stitches > 1000) {
    return { valid: false, error: '코수는 0~1000 사이여야 합니다' };
  }
  if (rows <= 0 || rows > 1000) {
    return { valid: false, error: '단수는 0~1000 사이여야 합니다' };
  }

  return { valid: true };
};
```

---

## 2. ConversionInput (변환 입력)

사용자가 변환하고자 하는 단수 또는 코수 값.

### Attributes
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| stitches | Number | Optional | ≥ 0, ≤ 10000 | 변환할 코수 (null 가능) |
| rows | Number | Optional | ≥ 0, ≤ 10000 | 변환할 단수 (null 가능) |

**Note**: `stitches`와 `rows` 중 최소 하나는 반드시 입력되어야 함.

### Validation Rules
```javascript
const validateConversionInput = (input) => {
  const { stitches, rows } = input;

  if (stitches === null && rows === null) {
    return { valid: false, error: '코수 또는 단수 중 하나는 입력해야 합니다' };
  }
  if (stitches !== null && (stitches < 0 || stitches > 10000)) {
    return { valid: false, error: '코수는 0~10000 사이여야 합니다' };
  }
  if (rows !== null && (rows < 0 || rows > 10000)) {
    return { valid: false, error: '단수는 0~10000 사이여야 합니다' };
  }

  return { valid: true };
};
```

### Example
```json
{
  "stitches": 50,
  "rows": 100
}
```

---

## 3. ConversionResult (변환 결과)

계산된 변환 값.

### Attributes
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| convertedStitches | Number | Optional | 변환된 코수 (입력 시에만 계산) |
| convertedRows | Number | Optional | 변환된 단수 (입력 시에만 계산) |

**Precision**: 소수점 2자리로 반올림.

### Calculation Formula
```
convertedStitches = inputStitches × (actualGauge.stitches / baseGauge.stitches)
convertedRows = inputRows × (actualGauge.rows / baseGauge.rows)
```

### Example
```json
{
  "convertedStitches": 62.5,
  "convertedRows": 120
}
```

---

## 4. MenuItem (메뉴 항목)

네비게이션 구조의 구성 요소.

### Attributes
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | String | Yes | Unique, kebab-case | 메뉴 항목 고유 ID |
| title | String | Yes | 1~50 chars | 메뉴 항목 표시 텍스트 |
| url | String | Optional | Valid path | 페이지 URL (3depth만 필수) |
| children | Array<MenuItem> | Optional | Max 3 depth | 하위 메뉴 항목 |
| depth | Number | Computed | 1, 2, or 3 | 메뉴 깊이 레벨 |

### Depth Classification
- **1depth (Category)**: 최상위 카테고리, `url` 없음, `children` 필수
- **2depth (Subcategory)**: 하위 카테고리, `url` 없음, `children` 필수
- **3depth (Feature)**: 실제 기능 페이지, `url` 필수, `children` 없음

### Hierarchical Structure
```
MenuItem (depth=1)
  ├─ MenuItem (depth=2)
  │   ├─ MenuItem (depth=3, url="/pages/feature-a.html")
  │   └─ MenuItem (depth=3, url="/pages/feature-b.html")
  └─ MenuItem (depth=2)
      └─ MenuItem (depth=3, url="/pages/feature-c.html")
```

### Validation Rules
```javascript
const validateMenuItem = (item, depth = 1) => {
  if (!item.id || !item.title) {
    return { valid: false, error: 'id와 title은 필수입니다' };
  }

  if (depth === 3 && !item.url) {
    return { valid: false, error: '3depth 항목은 url이 필수입니다' };
  }

  if (depth < 3 && !item.children) {
    return { valid: false, error: '1, 2depth 항목은 children이 필수입니다' };
  }

  if (depth > 3) {
    return { valid: false, error: '메뉴는 최대 3depth까지 지원합니다' };
  }

  if (item.children) {
    return item.children.every(child => validateMenuItem(child, depth + 1));
  }

  return { valid: true };
};
```

### Example
```json
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
```

**URL 매핑 규칙**:
- URL 경로 = 메뉴 depth 구조
- 패턴: `/pages/{1depth-id}/{2depth-id}/{3depth-id}.html`
- 예시: `/pages/knitting-tools/gauge-tools/gauge-converter.html`

---

## 5. Page (페이지)

각각의 유틸리티 기능을 제공하는 단위.

### Attributes
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | String | Yes | 페이지 고유 URL (예: /pages/gauge-converter.html) |
| title | String | Yes | 페이지 제목 (브라우저 탭, SEO) |
| content | String | Yes | 페이지 HTML 콘텐츠 |

### State Management
- **Cached**: 방문한 페이지는 `Map`에 저장
- **Active**: 현재 표시 중인 페이지
- **Unvisited**: 아직 로드되지 않은 페이지

### Example
```javascript
const pageCache = new Map([
  ['/pages/knitting-tools/gauge-tools/gauge-converter.html', {
    url: '/pages/knitting-tools/gauge-tools/gauge-converter.html',
    title: '게이지 변환 계산기',
    content: '<div>...</div>'
  }],
  ['/pages/home.html', {
    url: '/pages/home.html',
    title: '홈',
    content: '<div>...</div>'
  }]
]);
```

**페이지 경로 규칙**:
- 홈: `/pages/home.html` (루트)
- 기능 페이지: `/pages/{1depth}/{2depth}/{3depth}.html`
- CSS: `/css/{1depth}/{2depth}/{3depth}.css`
- JS: `/js/{1depth}/{2depth}/{3depth}.js`

---

## 6. RouterState (라우터 상태)

SPA 라우팅 시스템의 현재 상태.

### Attributes
| Field | Type | Description |
|-------|------|-------------|
| currentPath | String | 현재 활성화된 페이지 URL |
| previousPath | String | 이전 페이지 URL (뒤로가기용) |
| pageCache | Map<String, Page> | 방문한 페이지 캐시 |

### State Transitions
```
Initial (/) → Navigate → Loading → Loaded → Cached
                  ↓           ↓
                Error → Show Error Message
```

### Example
```javascript
const routerState = {
  currentPath: '/pages/knitting-tools/gauge-tools/gauge-converter.html',
  previousPath: '/pages/home.html',
  pageCache: new Map([
    ['/pages/home.html', { /* cached page */ }],
    ['/pages/knitting-tools/gauge-tools/gauge-converter.html', { /* cached page */ }]
  ])
};
```

---

## Data Flow Diagram

```
User Input (Form)
    ↓
ConversionInput (Validation)
    ↓
BaseGauge + ActualGauge
    ↓
Calculation (convertGauge)
    ↓
ConversionResult
    ↓
UI Display

---

User Click (Menu)
    ↓
MenuItem (Selected)
    ↓
Router (navigateTo)
    ↓
Page (Load or Cache)
    ↓
UI Update
```

## Summary

5개의 핵심 엔티티와 1개의 상태 객체로 데이터 모델이 정의되었습니다:
1. **Gauge**: 게이지 측정 데이터 (BaseGauge, ActualGauge)
2. **ConversionInput**: 사용자 입력 (변환할 단수/코수)
3. **ConversionResult**: 계산 결과
4. **MenuItem**: 3depth 메뉴 구조
5. **Page**: SPA 페이지 단위
6. **RouterState**: 라우팅 상태 관리

모든 엔티티는 검증 규칙을 가지며, 헌법 원칙(Vanilla JS, 클라이언트 측 처리)을 준수합니다.
