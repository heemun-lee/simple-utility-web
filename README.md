# Simple Utility Web

편물 도구를 위한 정적 웹 애플리케이션

## 기능

- **게이지 변환 계산기**: 기준 게이지와 실제 게이지를 입력하여 필요한 코수와 단수를 계산
  - 10cm x 10cm 또는 4 inch x 4 inch 기준 선택 가능
  - 선택한 측정 단위에 맞춰 자동 변환 계산

## 기술 스택

- HTML, CSS, JavaScript (Vanilla ES6+)
- Playwright (E2E/Accessibility Testing)
- GitHub Pages (호스팅)

## 프로젝트 구조

```
simple-utility-web/
├── index.html              # SPA 진입점
├── css/
│   ├── main.css            # 전역 스타일
│   ├── menu.css            # 메뉴 스타일
│   ├── mobile.css          # 반응형 디자인
│   └── knitting-tools/gauge-tools/
│       └── gauge-converter.css
├── js/
│   ├── utils.js            # 유틸리티 함수
│   ├── router.js           # SPA 라우팅
│   ├── menu.js             # 메뉴 관리
│   └── knitting-tools/gauge-tools/
│       ├── validator.js
│       └── gauge-converter.js
├── pages/
│   ├── home.html
│   └── knitting-tools/gauge-tools/
│       └── gauge-converter.html
├── data/
│   └── menu.json           # 메뉴 구조 정의
└── tests/
    ├── e2e/
    ├── accessibility/
    └── visual/
```

## 로컬 개발

### 1. 서버 시작

```bash
python3 -m http.server 8000
```

### 2. 브라우저에서 확인

http://localhost:8000

### 3. 테스트 실행

```bash
# 모든 테스트
npx playwright test

# E2E 테스트만
npx playwright test tests/e2e

# Accessibility 테스트만
npx playwright test tests/accessibility

# 특정 브라우저
npx playwright test --project=chromium
```

## 테스트 결과

- **E2E 테스트**: 10개 (전부 통과)
- **Accessibility 테스트**: 7개 (전부 통과)
- **총**: 17개 테스트 통과 ✅

## 배포

GitHub Pages를 통해 자동 배포됩니다.

URL: https://[username].github.io/simple-utility-web/

## 접근성

- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 지원 (ARIA 속성)
- 모바일 터치 타겟 크기 (44x44px 이상)

## 브라우저 지원

- Chrome/Edge (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)

## 라이센스

MIT
