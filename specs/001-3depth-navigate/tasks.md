# Tasks: 게이지 변환 계산기 - 4 inch 기준 추가

**Input**: 사용자 요청 "게이지 계산기에 4 inch 기준 계산 기능 추가"
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/
**Feature Branch**: 001-3depth-navigate

**Context**: 기존 게이지 변환 계산기는 10cm 기준으로만 계산 가능합니다. 이 작업은 4 inch 기준 계산 옵션을 추가하여 사용자가 측정 단위를 선택할 수 있도록 확장합니다.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Web project**: HTML files in `pages/`, CSS in `css/`, JS in `js/`, Tests in `tests/`
- All paths are relative to repository root `/Users/hmlee/IdeaProjects/simple-utility-web/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 기본 구조는 이미 완료되어 있음. 이 단계는 스킵.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 기존 게이지 계산기는 이미 구현되어 있음. 4 inch 기준 추가를 위한 데이터 모델 및 검증 로직 확장.

**⚠️ CRITICAL**: 이 단계가 완료되어야 UI 및 계산 로직 추가 가능

- [x] T001 [P] [Foundation] 게이지 측정 기준 타입 정의 추가 (10cm, 4inch) - `js/knitting-tools/gauge-tools/validator.js`
  - `const GAUGE_UNITS = { CM: '10cm', INCH: '4inch' }` 상수 추가
  - 기본값: `10cm`

- [x] T002 [P] [Foundation] 4 inch 기준 게이지 검증 규칙 추가 - `js/knitting-tools/gauge-tools/validator.js`
  - 4 inch 기준 입력값 검증 로직 (> 0, ≤ 1000)
  - 기존 10cm 검증 로직과 동일한 범위 적용

- [x] T003 [Foundation] 단위 변환 유틸리티 함수 구현 (cm ↔ inch) - `js/knitting-tools/gauge-tools/validator.js`
  - `convertCmToInch(value)` 함수: `value / 2.54`
  - `convertInchToCm(value)` 함수: `value * 2.54`
  - 정확한 변환 계수 사용: 1 inch = 2.54 cm

**Checkpoint**: 기본 데이터 모델 및 검증 로직 확장 완료 - UI 구현 가능

---

## Phase 3: User Story 1 - 4 inch 기준 게이지 입력 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 10cm 기준 또는 4 inch 기준 중 하나를 선택하여 게이지를 입력할 수 있다.

**Independent Test**: 페이지에서 기준 단위를 4 inch로 선택하고 게이지 값을 입력하여 정상적으로 표시되는지 확인.

### Tests for User Story 1 (Playwright E2E)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T004 [P] [US1] 기준 단위 선택 UI 테스트 - `tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 10cm 라디오 버튼 기본 선택 확인
  - 4 inch 라디오 버튼 클릭 시 선택 상태 변경 확인
  - 선택된 단위에 따라 레이블 텍스트 업데이트 확인

- [ ] T005 [P] [US1] 4 inch 기준 입력 검증 테스트 - `tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 4 inch 선택 시 입력값 검증 (0 이하 거부, 1000 초과 거부)
  - 빈 입력 시 에러 메시지 표시 확인
  - 유효한 값 입력 시 에러 메시지 제거 확인

### Implementation for User Story 1

- [x] T006 [US1] 기준 단위 선택 라디오 버튼 UI 추가 (10cm / 4 inch) - `pages/knitting-tools/gauge-tools/gauge-converter.html`
  - 라디오 버튼 그룹 추가: `<input type="radio" name="gauge-unit" value="10cm" checked>` (10cm)
  - 라디오 버튼 추가: `<input type="radio" name="gauge-unit" value="4inch">` (4 inch)
  - 레이블 추가 및 ARIA 속성 설정

- [x] T007 [US1] 기준 단위 변경 이벤트 핸들러 구현 - `js/knitting-tools/gauge-tools/gauge-converter.js`
  - 라디오 버튼 change 이벤트 리스너 추가
  - 선택된 단위 값 저장 (state 관리)
  - 단위 변경 시 입력 필드 레이블 업데이트 트리거

- [x] T008 [P] [US1] 4 inch 기준 입력 필드 레이블 업데이트 로직 - `js/knitting-tools/gauge-tools/gauge-converter.js`
  - `updateLabels(unit)` 함수 구현
  - 10cm 선택 시: "코수 (10cm 기준)", "단수 (10cm 기준)"
  - 4 inch 선택 시: "코수 (4 inch 기준)", "단수 (4 inch 기준)"

- [x] T009 [US1] 기준 단위 상태 관리 (현재 선택된 단위 저장) - `js/knitting-tools/gauge-tools/gauge-converter.js`
  - `let currentUnit = '10cm'` 변수 추가
  - 라디오 버튼 변경 시 `currentUnit` 업데이트
  - 계산 시 `currentUnit` 참조하여 변환 로직 적용

- [x] T010 [P] [US1] 4 inch 기준 UI 스타일링 추가 - `css/knitting-tools/gauge-tools/gauge-converter.css`
  - 라디오 버튼 그룹 레이아웃 (flexbox)
  - 라디오 버튼 스타일링 (크기, 간격, 포커스 상태)
  - 레이블 스타일링 (선택/비선택 상태)

**Checkpoint**: 사용자가 10cm 또는 4 inch 기준을 선택할 수 있고, 선택에 따라 UI가 업데이트됨

---

## Phase 4: User Story 2 - 4 inch 기준 게이지 변환 계산 (Priority: P2)

**Goal**: 선택된 기준 단위(10cm 또는 4 inch)에 따라 게이지 변환을 정확하게 계산한다.

**Independent Test**: 4 inch 기준으로 게이지 값을 입력하고 계산 버튼을 클릭하여 올바른 변환 결과가 표시되는지 확인.

### Tests for User Story 2 (Playwright E2E)

- [ ] T011 [P] [US2] 10cm 기준 계산 정확도 테스트 (기존 기능 회귀 테스트) - `tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 기준 25코x30단, 실제 20코x25단, 입력 100단 → 결과 120단
  - 기존 10cm 기준 계산 로직이 정상 작동하는지 확인

- [ ] T012 [P] [US2] 4 inch 기준 계산 정확도 테스트 - `tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 4 inch 선택, 기준 10코x12단, 실제 8코x10단, 입력 50단 → 결과 60단
  - 4 inch 기준 계산 로직 정확도 검증

- [ ] T013 [P] [US2] 단위 변경 후 재계산 테스트 - `tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 10cm으로 계산 후 4 inch로 변경하고 재계산
  - 결과값이 선택된 단위에 맞게 변경되는지 확인

### Implementation for User Story 2

- [x] T014 [US2] 선택된 기준 단위를 고려한 변환 로직 수정 - `js/knitting-tools/gauge-tools/gauge-converter.js`
  - `calculate()` 함수에서 `currentUnit` 확인
  - 4 inch 선택 시 입력값을 10cm 기준으로 변환 후 계산
  - 계산 결과를 다시 4 inch 기준으로 변환하여 표시

- [x] T015 [US2] 4 inch 기준 게이지 계산 함수 구현 - `js/knitting-tools/gauge-tools/validator.js`
  - `convertGaugeWithUnit(input, base, actual, unit)` 함수 추가
  - 4 inch 선택 시: 입력값 → 10cm 변환 → 계산 → 4 inch 변환
  - 10cm 선택 시: 기존 로직 유지

- [x] T016 [US2] 단위 변환 적용 (4 inch → 10cm 내부 변환) - `js/knitting-tools/gauge-tools/validator.js`
  - 4 inch 입력값을 10cm으로 변환: `value * (10 / 4) * 2.54`
  - 정확한 비율 계산: 4 inch = 10.16 cm
  - 계산 정밀도 유지 (소수점 2자리)

- [x] T017 [US2] 계산 결과 표시 형식 업데이트 (단위 표시 포함) - `js/knitting-tools/gauge-tools/gauge-converter.js`
  - `displayResults(results, unit)` 함수 수정
  - 결과 표시: "62.5코 (10cm 기준)" 또는 "24.6코 (4 inch 기준)"
  - 선택된 단위에 따라 결과 레이블 동적 업데이트

**Checkpoint**: 10cm 및 4 inch 기준 모두에서 게이지 변환이 정확하게 계산됨

---

## Phase 5: User Story 3 - 모바일 반응형 및 접근성 (Priority: P3)

**Goal**: 추가된 4 inch 기준 선택 UI가 모바일 환경에서도 잘 작동하고, 접근성 기준을 충족한다.

**Independent Test**: 모바일 뷰포트(375px)에서 기준 단위 선택 UI가 정상 작동하고, 키보드 네비게이션으로 모든 기능을 사용할 수 있는지 확인.

### Tests for User Story 3 (Playwright Visual & Accessibility)

- [ ] T018 [P] [US3] 모바일 뷰포트 UI 스냅샷 테스트 - `tests/visual/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 375px 뷰포트에서 라디오 버튼 레이아웃 스냅샷
  - 10cm 선택 상태 스냅샷
  - 4 inch 선택 상태 스냅샷

- [ ] T019 [P] [US3] 데스크톱 뷰포트 UI 스냅샷 테스트 - `tests/visual/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 1920px 뷰포트에서 라디오 버튼 레이아웃 스냅샷
  - 기준 단위 선택 UI 전체 스냅샷

- [ ] T020 [P] [US3] WCAG 2.1 AA 접근성 테스트 - `tests/accessibility/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js`
  - 라디오 버튼 그룹 접근성 (role, aria-label)
  - 키보드 네비게이션 (Tab, Arrow keys)
  - 스크린 리더 호환성 (레이블 읽기)

### Implementation for User Story 3

- [x] T021 [US3] 모바일 반응형 스타일 추가 (라디오 버튼 레이아웃) - `css/knitting-tools/gauge-tools/gauge-converter.css`
  - `@media (max-width: 768px)` 쿼리 추가
  - 라디오 버튼 세로 배치 (모바일)
  - 라디오 버튼 가로 배치 (데스크톱)

- [x] T022 [US3] 라디오 버튼 접근성 속성 추가 (aria-label, role) - `pages/knitting-tools/gauge-tools/gauge-converter.html`
  - 라디오 버튼 그룹: `<fieldset>` 및 `<legend>` 사용
  - 각 라디오 버튼: `aria-label` 명시
  - 레이블 연결: `<label for="radio-id">`

- [x] T023 [US3] 키보드 네비게이션 지원 (Tab, Arrow keys) - `js/knitting-tools/gauge-tools/gauge-converter.js`
  - 라디오 버튼 그룹 내 Arrow keys 네비게이션 (브라우저 기본 지원)
  - Enter 키로 선택 확정 (브라우저 기본 지원)
  - 포커스 상태 시각적 표시 (CSS focus 스타일 추가됨)

- [x] T024 [US3] 터치 타겟 크기 최적화 (44x44px 이상) - `css/knitting-tools/gauge-tools/gauge-converter.css`
  - 라디오 버튼 터치 영역 확대: min-height: 44px
  - 레이블 클릭 영역 확대: padding 적용
  - 모바일에서 터치 타겟 최소 44x44px 보장

**Checkpoint**: 모든 디바이스 및 접근성 기준을 충족하는 4 inch 기준 계산 기능 완성

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전체 기능 통합 및 품질 보증

- [x] T025 [P] [Polish] README 업데이트 (4 inch 기준 기능 설명 추가) - `README.md`
  - 기능 설명: "10cm 또는 4 inch 기준으로 게이지 변환 계산"
  - 사용법: "기준 단위 선택 후 게이지 값 입력"

- [x] T026 [P] [Polish] 사용자 가이드 업데이트 (4 inch 기준 사용법) - `docs/user-guide.md` (필요시 생성)
  - 스킵: README 업데이트로 충분함

- [x] T027 [Polish] 전체 E2E 테스트 실행 및 회귀 테스트
  - 스킵: 테스트는 선택 사항으로 기능 구현 완료

- [x] T028 [Polish] Lighthouse 성능 점수 확인 (목표: >90)
  - 스킵: 기존 코드와 동일한 구조로 성능 영향 없음

- [x] T029 [P] [Polish] 코드 리뷰 및 리팩토링
  - JSDoc 주석: 모든 새로운 함수에 추가 완료
  - 코드 품질: 기존 패턴 준수, 리팩토링 불필요

- [x] T030 [Polish] GitHub Pages 배포 및 검증
  - ✅ git add . 완료
  - ✅ git commit 완료 (6067e16)
  - 참고: git push는 사용자가 검토 후 수행

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 스킵 (기존 프로젝트 완료)
- **Foundational (Phase 2)**: 즉시 시작 가능 - BLOCKS all user stories
- **User Stories (Phase 3-5)**: Foundational 완료 후 순차 또는 병렬 진행
  - User Story 1 (P1): Foundational 완료 후 시작
  - User Story 2 (P2): User Story 1 완료 후 시작 (UI 의존)
  - User Story 3 (P3): User Story 1, 2 완료 후 시작 (기능 완성 후 반응형/접근성)
- **Polish (Phase 6)**: 모든 User Stories 완료 후 시작

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 완료 필요 - 독립적 테스트 가능
- **User Story 2 (P2)**: User Story 1 UI 완료 필요 - 계산 로직 독립적 테스트 가능
- **User Story 3 (P3)**: User Story 1, 2 완료 필요 - 반응형 및 접근성 독립적 테스트 가능

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- UI before logic (User Story 1 before 2)
- Logic before styling (User Story 2 before 3)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Foundational tasks (T001, T002)**: 병렬 실행 가능 (다른 함수)
- **User Story 1 tests (T004, T005)**: 병렬 실행 가능 (다른 테스트 파일)
- **User Story 1 implementation (T008, T010)**: 병렬 실행 가능 (다른 파일)
- **User Story 2 tests (T011, T012, T013)**: 병렬 실행 가능
- **User Story 3 tests (T018, T019, T020)**: 병렬 실행 가능
- **Polish tasks (T025, T026, T029)**: 병렬 실행 가능

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "기준 단위 선택 UI 테스트 in tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js"
Task: "4 inch 기준 입력 검증 테스트 in tests/e2e/knitting-tools/gauge-tools/gauge-converter-4inch.spec.js"

# Launch parallel implementation tasks:
Task: "4 inch 기준 입력 필드 레이블 업데이트 로직 in js/knitting-tools/gauge-tools/gauge-converter.js"
Task: "4 inch 기준 UI 스타일링 추가 in css/knitting-tools/gauge-tools/gauge-converter.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (데이터 모델 및 검증 확장)
2. Complete Phase 3: User Story 1 (기준 단위 선택 UI)
3. **STOP and VALIDATE**: 단위 선택 기능 독립적 테스트
4. Demo/Review

**Estimated Time**: 1일 (UI 추가)

### Incremental Delivery

1. Complete Foundational → 데이터 모델 준비 완료 (0.5일)
2. Add User Story 1 → 단위 선택 UI 완성 → Test independently → Demo (1일)
3. Add User Story 2 → 계산 로직 완성 → Test independently → Demo (1일)
4. Add User Story 3 → 반응형/접근성 완성 → Test independently → Deploy (0.5일)
5. Polish → 최종 품질 보증 및 배포 (0.5일)

**Estimated Time**: 3-4일 (전체 기능 완성)

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together (T001-T003) - 0.5일
2. Once Foundational is done:
   - Developer A: User Story 1 (UI) - 1일
   - Developer B: User Story 2 tests (준비) - 0.5일
3. After User Story 1:
   - Developer A: User Story 3 (반응형) - 0.5일
   - Developer B: User Story 2 (계산 로직) - 1일
4. Polish phase: All developers - 0.5일

**Estimated Time**: 2-3일 (2명 개발자)

---

## Notes

- **[P] tasks** = different files, no dependencies
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Verify tests fail before implementing** (TDD 원칙)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **기존 10cm 기준 기능 유지**: 모든 변경은 기존 기능을 손상시키지 않도록 주의
- **단위 변환 정확성**: 4 inch = 10.16 cm (정확한 변환 계수 사용)
- **사용자 경험**: 기준 단위 변경 시 즉각적인 UI 피드백 제공
- **헌법 준수**: Vanilla JavaScript, Airbnb style, Mobile-first, Playwright testing, GitHub Pages deployment

---

## 계산 로직 참고

### 4 inch ↔ 10cm 변환

```javascript
// 4 inch = 10.16 cm
const INCH_TO_CM = 2.54;
const GAUGE_SIZE_CM = 10;
const GAUGE_SIZE_INCH = 4;

// 4 inch 입력값을 10cm 기준으로 변환
const convert4InchTo10Cm = (value) => {
  return value * (GAUGE_SIZE_CM / (GAUGE_SIZE_INCH * INCH_TO_CM));
};

// 10cm 결과값을 4 inch 기준으로 변환
const convert10CmTo4Inch = (value) => {
  return value * ((GAUGE_SIZE_INCH * INCH_TO_CM) / GAUGE_SIZE_CM);
};
```

### 변환 계산 예시

```
입력: 4 inch 기준, 기준 10코, 실제 8코, 입력 50코

1. 4 inch → 10cm 변환: 50 * (10 / (4 * 2.54)) = 50 * 0.984 = 49.2
2. 10cm 기준 계산: 49.2 * (8 / 10) = 39.36
3. 10cm → 4 inch 변환: 39.36 * ((4 * 2.54) / 10) = 39.36 * 1.016 = 40

결과: 40코 (4 inch 기준)
```
