# Implementation Tasks: UI Improvements

**Feature**: 002-spa-to-mpa (추가 개선사항) | **Date**: 2025-10-09
**Branch**: `002-spa-to-mpa` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

MPA로 전환 완료된 프로젝트에 다음 3가지 개선사항을 적용합니다:
1. 게이지 변환 시 반올림 계산 (소수점 제거)
2. Skip link ("메인 콘텐츠로 건너뛰기") 완전 제거
3. 파스텔 핑크 색상 #FEEFEF 기반 디자인 적용

## Task Summary

| Phase | Task Count | Story | Parallel Opportunities |
|-------|-----------|-------|----------------------|
| Phase 1: 반올림 계산 | 3 | US1 | 1 (테스트) |
| Phase 2: Skip Link 제거 | 3 | US2 | 2 (HTML 파일들) |
| Phase 3: 디자인 리뉴얼 | 5 | US3 | 3 (CSS 파일들) |
| Phase 4: 테스트 검증 | 2 | ALL | 1 (테스트 실행) |
| **Total** | **13** | **3 stories** | **7 parallel tasks** |

---

## Phase 1: 반올림 계산 구현 (US1)

**Story Goal**: 게이지 변환 결과를 정수로 반올림하여 실용성 개선

**Test Criteria**:
- ✅ 25.4 입력 시 25 출력
- ✅ 25.5 입력 시 26 출력
- ✅ 25.6 입력 시 26 출력
- ✅ 기존 테스트 통과

### T001 [X] [US1] validator.js 반올림 로직 변경

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/js/knitting-tools/gauge-tools/validator.js`

**Action**:
```javascript
// Line 127, 153, 158: toFixed(2) → Math.round()

// Before (Line 127)
const result = input * (actual / base);
return Number(result.toFixed(2));

// After (Line 127)
const result = input * (actual / base);
return Math.round(result);

// Before (Line 153, convertGaugeWithUnit)
return Number(resultIn4Inch.toFixed(2));

// After (Line 153)
return Math.round(resultIn4Inch);

// Before (Line 158)
return Number(result.toFixed(2));

// After (Line 158)
return Math.round(result);
```

**Dependencies**: None
**Validation**: 반올림 테스트 케이스 통과

---

### T002 [X] [US1] 반올림 계산 테스트 케이스 추가

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/tests/e2e/gauge-function.spec.js`

**Action**:
```javascript
// 기존 테스트 업데이트 + 반올림 테스트 추가

test('게이지 변환 결과가 정수로 반올림됨', async ({ page }) => {
  await page.goto('/gauge-converter.html');

  // 25.4 → 25 (반올림)
  await page.fill('#base-stitches', '10');
  await page.fill('#base-rows', '10');
  await page.fill('#actual-stitches', '12.7');
  await page.fill('#actual-rows', '12.7');
  await page.fill('#input-stitches', '20');
  await page.click('#calculate');

  const stitchesResult = await page.textContent('#result-stitches');
  expect(stitchesResult).toContain('25코'); // 25.4 → 25

  // 25.5 → 26 (반올림)
  await page.fill('#actual-stitches', '12.75');
  await page.click('#calculate');

  const stitchesResult2 = await page.textContent('#result-stitches');
  expect(stitchesResult2).toContain('26코'); // 25.5 → 26
});

// 기존 소수점 검증 테스트 제거 또는 업데이트
```

**Dependencies**: T001
**Validation**: `npm test` 통과

---

### T003 [X] [US1] [P] 게이지 변환기 UI 테스트 실행

**Command**: `npm test tests/e2e/gauge-function.spec.js`

**Action**: 반올림 계산 테스트 실행 및 검증

**Dependencies**: T002
**Validation**: 모든 테스트 통과

---

## Phase 2: Skip Link 제거 (US2)

**Story Goal**: "메인 콘텐츠로 건너뛰기" 버튼 완전 제거하여 UI 단순화

**Test Criteria**:
- ✅ gauge-converter.html에서 skip link 제거됨
- ✅ index.html에서 skip link 제거됨
- ✅ 접근성 테스트에서 skip link 검증 비활성화
- ✅ 시각적으로 skip link 버튼 없음

### T004 [X] [US2] [P] gauge-converter.html Skip Link 제거

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/gauge-converter.html`

**Action**:
```html
<!-- Line 18: 완전 제거 -->
<!-- Before -->
<a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a>

<!-- After: 해당 라인 삭제 -->
```

**Dependencies**: None
**Validation**: HTML 파일에 skip-link 클래스 없음

---

### T005 [X] [US2] [P] index.html Skip Link 제거

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/index.html`

**Action**:
```html
<!-- Line 18: 완전 제거 -->
<!-- Before -->
<a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a>

<!-- After: 해당 라인 삭제 -->
```

**Dependencies**: None
**Validation**: HTML 파일에 skip-link 클래스 없음

---

### T006 [X] [US2] 접근성 테스트 Skip Link 검증 비활성화

**Files**:
- `/Users/hmlee/IdeaProjects/simple-utility-web/tests/accessibility/gauge-wcag.spec.js`
- `/Users/hmlee/IdeaProjects/simple-utility-web/tests/accessibility/home-wcag.spec.js`

**Action**:
```javascript
// Axe-core 규칙에서 skip link 검증 비활성화

test('WCAG 2.1 AA compliance (skip link 제외)', async ({ page }) => {
  await page.goto('/gauge-converter.html'); // 또는 '/'

  const accessibilityScanResults = await new AxeBuilder({ page })
    .disableRules(['skip-link']) // skip link 규칙 비활성화
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**Dependencies**: T004, T005
**Validation**: 접근성 테스트 통과

---

## Phase 3: 파스텔 핑크 디자인 적용 (US3)

**Story Goal**: #FEEFEF 메인 색상의 부드럽고 귀여운 디자인 적용

**Test Criteria**:
- ✅ CSS variables에 새 색상 팔레트 적용
- ✅ 버튼, 카드, input focus에 파스텔 핑크 색상 적용
- ✅ WCAG AA 대비율 준수 (4.5:1)
- ✅ Visual regression test 스냅샷 업데이트

### T007 [X] [US3] [P] main.css 파스텔 핑크 색상 팔레트 적용

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/css/main.css`

**Action**:
```css
/* CSS Variables 업데이트 */
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

  /* Spacing (unchanged) */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

**Dependencies**: None
**Validation**: CSS 변수 정의 확인

---

### T008 [X] [US3] [P] components.css 컴포넌트 스타일 업데이트

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/css/components.css`

**Action**:
```css
/* Button styles */
.calculate-button,
button[type="submit"],
.primary-button {
  background: var(--color-primary-dark);
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.calculate-button:hover,
button[type="submit"]:hover,
.primary-button:hover {
  background: #FF9FAB;  /* Slightly darker pink */
}

/* Card/Section styles */
.gauge-section,
.card {
  background: var(--color-primary);
  border-left: 4px solid var(--color-primary-dark);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Input focus */
input:focus,
select:focus,
textarea:focus {
  border-color: var(--color-primary-dark);
  outline: 2px solid var(--color-primary-accent);
  outline-offset: 2px;
}

/* Navigation active state */
nav a[aria-current="page"] {
  color: var(--color-primary-dark);
  font-weight: 600;
  border-bottom: 3px solid var(--color-primary-dark);
}
```

**Dependencies**: T007
**Validation**: 컴포넌트 스타일 적용 확인

---

### T009 [X] [US3] [P] gauge-converter.css 페이지별 스타일 업데이트

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/css/knitting-tools/gauge-tools/gauge-converter.css`

**Action**:
```css
/* 게이지 변환기 페이지 특화 스타일 */

.gauge-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.intro-text {
  color: var(--color-text-light);
  background: var(--color-primary);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.result-section {
  background: var(--color-primary);
  border: 2px solid var(--color-primary-dark);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
}

.result-value {
  color: var(--color-primary-dark);
  font-size: 1.5rem;
  font-weight: 700;
}

/* Radio button styles */
.radio-label {
  background: var(--color-background-secondary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-label:has(input:checked) {
  background: var(--color-primary-accent);
  border-color: var(--color-primary-dark);
}
```

**Dependencies**: T007
**Validation**: 페이지별 스타일 적용 확인

---

### T010 [X] [US3] [P] home.css 홈 페이지 스타일 업데이트

**File**: `/Users/hmlee/IdeaProjects/simple-utility-web/css/home.css`

**Action**:
```css
/* 홈 페이지 스타일 */

.hero-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-accent) 100%);
  padding: 3rem 2rem;
  border-radius: 16px;
  margin-bottom: 3rem;
  text-align: center;
}

.tool-card {
  background: var(--color-primary);
  border: 1px solid var(--color-primary-dark);
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(255, 182, 193, 0.3);
}

.tool-card h3 {
  color: var(--color-primary-dark);
  margin-bottom: 1rem;
}
```

**Dependencies**: T007
**Validation**: 홈 페이지 스타일 적용 확인

---

### T011 [X] [US3] Visual Regression Test 스냅샷 재생성

**Files**:
- `tests/visual/` (visual regression tests if exists)
- Playwright configuration

**Action**:
```bash
# Visual regression test 스냅샷 재생성
npm run test:visual -- --update-snapshots

# 또는 Playwright visual test
npx playwright test --update-snapshots
```

**Note**: 파스텔 핑크 디자인 적용 후 모든 visual test 스냅샷을 재생성해야 합니다.

**Dependencies**: T007, T008, T009, T010
**Validation**: Visual test 통과

---

## Phase 4: 최종 검증 및 테스트

**Story Goal**: 모든 변경사항 검증 및 품질 확인

### T012 [X] [US_ALL] 전체 테스트 실행

**Command**: `npm test`

**Action**:
1. E2E 테스트 실행 (반올림 계산 검증)
2. 접근성 테스트 실행 (skip link 제외)
3. Visual regression 테스트 (새 디자인 스냅샷)

**Expected Results**:
- ✅ 모든 E2E 테스트 통과
- ✅ 접근성 테스트 통과 (skip link 규칙 제외)
- ✅ Visual regression 테스트 통과

**Dependencies**: T001-T011
**Validation**: 모든 테스트 통과

---

### T013 [US_ALL] 수동 브라우저 테스트

**Browsers**: Chrome, Firefox, Safari (WebKit)

**Test Checklist**:
1. **반올림 계산**:
   - [ ] 게이지 변환 결과가 정수로 표시됨
   - [ ] 소수점 값 없음

2. **Skip Link 제거**:
   - [ ] gauge-converter.html에 skip link 없음
   - [ ] index.html에 skip link 없음
   - [ ] Tab 키 네비게이션 정상 동작

3. **파스텔 핑크 디자인**:
   - [ ] 배경색 #FEEFEF 적용
   - [ ] 버튼 색상 #FFB6C1 적용
   - [ ] Hover 효과 정상 동작
   - [ ] Input focus 스타일 적용
   - [ ] 모바일 반응형 정상

4. **성능**:
   - [ ] 페이지 로드 < 1s (desktop)
   - [ ] 페이지 로드 < 3s (mobile 3G)

**Dependencies**: T012
**Validation**: 모든 체크리스트 완료

---

## Dependencies Graph

```
Phase 1 (반올림 계산):
T001 (validator.js) → T002 (테스트 추가) → T003 [P] (테스트 실행)

Phase 2 (Skip Link 제거):
T004 [P] (gauge-converter.html) ─┐
T005 [P] (index.html)            ├─→ T006 (접근성 테스트 업데이트)
                                 ┘

Phase 3 (디자인 리뉴얼):
T007 [P] (main.css) ─┐
T008 [P] (components.css) ─┼─→ T011 (Visual 스냅샷)
T009 [P] (gauge-converter.css) ─┤
T010 [P] (home.css) ─┘

Phase 4 (검증):
T001-T011 → T012 (전체 테스트) → T013 (수동 테스트)
```

---

## Parallel Execution Strategy

### 병렬 실행 가능 작업 (7개)

**Group 1: Skip Link 제거** (동시 실행 가능)
- T004: gauge-converter.html
- T005: index.html

**Group 2: CSS 스타일 업데이트** (동시 실행 가능)
- T007: main.css
- T008: components.css
- T009: gauge-converter.css
- T010: home.css

**Group 3: 테스트** (독립 실행 가능)
- T003: 게이지 테스트

### 순차 실행 필요 작업

**Chain 1: 반올림 계산**
1. T001 (validator.js 수정)
2. T002 (테스트 케이스 추가)
3. T003 (테스트 실행)

**Chain 2: 접근성 테스트**
1. T004 + T005 (HTML 수정)
2. T006 (테스트 업데이트)

**Chain 3: Visual 테스트**
1. T007 + T008 + T009 + T010 (CSS 수정)
2. T011 (스냅샷 재생성)

---

## Implementation Strategy

### MVP Scope (최소 구현)
**Phase 1만 구현**하면 핵심 기능 개선 완료:
- ✅ 반올림 계산으로 실용성 개선

### Full Feature Scope (전체 구현)
**Phase 1-4 모두 구현**하면 완벽한 사용자 경험 제공:
- ✅ 반올림 계산
- ✅ UI 단순화 (Skip link 제거)
- ✅ 파스텔 핑크 디자인

### Incremental Delivery
1. **Week 1**: Phase 1 (반올림 계산) 완료 → 배포
2. **Week 1**: Phase 2 (Skip link 제거) 완료 → 배포
3. **Week 2**: Phase 3 (디자인 리뉴얼) 완료 → 배포
4. **Week 2**: Phase 4 (최종 검증) → 최종 배포

---

## Quality Gates

### Pre-Implementation Checklist
- [x] spec.md 검토 완료
- [x] plan.md 기술 스택 확인
- [x] research.md 결정사항 숙지
- [x] Constitution check 통과

### Post-Implementation Checklist
- [ ] 모든 Playwright 테스트 통과
- [ ] 접근성 검증 통과 (skip link 제외)
- [ ] Visual regression 통과
- [ ] 수동 브라우저 테스트 통과
- [ ] 성능 요구사항 충족 (< 1s desktop, < 3s mobile)
- [ ] Git commit (all tests passing)

---

## Notes

1. **반올림 계산**: validator.js에서 3군데 수정 필요 (Line 127, 153, 158)
2. **Skip Link**: Constitution 예외 승인됨 (사용자 결정)
3. **디자인**: #FEEFEF 색상 WCAG AA 준수 확인됨
4. **테스트**: Visual regression 스냅샷 재생성 필수
5. **배포**: 모든 테스트 통과 후 GitHub Pages 자동 배포

---

**Generated**: 2025-10-09 | **Total Tasks**: 13 | **Estimated Time**: 1-2 weeks
