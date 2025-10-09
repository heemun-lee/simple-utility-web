# Feature Specification: SPA to MPA Conversion

**Branch**: `002-spa-to-mpa` | **Date**: 2025-10-09

## Problem Statement

현재 simple-utility-web는 SPA(Single Page Application) 구조로 구현되어 있습니다:
- 클라이언트 사이드 라우터(router.js)를 통한 페이지 전환
- History API를 사용한 URL 관리
- 동적으로 페이지 콘텐츠를 로드하여 DOM에 삽입

이를 전통적인 MPA(Multi-Page Application) 구조로 전환하여 각 페이지가 독립적인 HTML 파일로 제공되도록 변경하고자 합니다.

## User Stories

### As a user
- 페이지 간 이동 시 전체 페이지가 새로고침되어 명확한 전환을 경험할 수 있습니다
- 각 페이지가 독립적인 URL을 가지며 직접 접근 가능합니다
- 브라우저의 뒤로가기/앞으로가기가 자연스럽게 동작합니다

### As a developer
- 각 페이지의 코드가 독립적으로 관리되어 유지보수가 용이합니다
- 라우팅 로직 없이 단순한 HTML 링크로 페이지 전환이 가능합니다
- GitHub Pages에서 각 페이지에 직접 접근이 가능합니다

## Requirements

### Functional Requirements

1. **페이지 구조 변경**
   - 각 유틸리티 페이지를 독립적인 HTML 파일로 분리
   - 메인 페이지(index.html)는 홈 또는 유틸리티 목록으로 기능
   - 모든 페이지 간 이동은 `<a>` 태그를 통한 전체 페이지 로드

2. **네비게이션 시스템**
   - 클라이언트 사이드 라우터(router.js) 제거
   - 각 페이지에 공통 네비게이션 메뉴 포함
   - 현재 페이지 표시를 위한 활성 상태 표시

3. **공통 리소스 관리**
   - CSS 파일은 모든 페이지에서 공유
   - JavaScript 유틸리티는 필요한 페이지에서만 로드
   - 메뉴 데이터(menu.json)는 각 페이지에서 개별적으로 로드

4. **GitHub Pages 호환성**
   - 모든 페이지가 직접 URL로 접근 가능
   - 상대 경로를 사용하여 서브디렉토리 배포 지원
   - 404 페이지 처리

### Non-Functional Requirements

1. **성능**
   - 초기 페이지 로드: < 1s (desktop), < 3s (mobile 3G)
   - 페이지 전환: 브라우저 기본 속도
   - 캐시 활용: CSS/JS 파일 브라우저 캐싱

2. **접근성**
   - WCAG 2.1 AA 준수 유지
   - 시맨틱 HTML 사용
   - 키보드 네비게이션 지원

3. **호환성**
   - 현대 브라우저(Chrome, Firefox, Safari, Edge) 지원
   - 모바일 반응형 디자인 유지

## Success Criteria

1. **기능 검증**
   - [ ] 모든 유틸리티 페이지가 독립적인 HTML 파일로 존재
   - [ ] router.js 및 SPA 관련 코드 완전 제거
   - [ ] 각 페이지에 공통 네비게이션 메뉴 포함
   - [ ] 브라우저 뒤로가기/앞으로가기 정상 동작

2. **품질 검증**
   - [ ] Playwright 테스트로 모든 페이지 네비게이션 검증
   - [ ] Lighthouse 성능 점수 90+ 유지
   - [ ] 접근성 검증 통과

3. **배포 검증**
   - [ ] GitHub Pages에서 모든 페이지 직접 접근 가능
   - [ ] 서브디렉토리 배포 환경에서 정상 동작

## Out of Scope

- 백엔드 서버 도입
- 서버 사이드 렌더링(SSR)
- 프레임워크 도입(React, Vue 등)
- 빌드 프로세스 추가

## Technical Considerations

### Current Architecture (SPA)
```
index.html → router.js → 동적 페이지 로드
                       → History API 관리
                       → DOM 조작
```

### Target Architecture (MPA)
```
index.html (홈)
calculator.html (계산기)
converter.html (변환기)
...
각 페이지:
  - 독립적인 HTML
  - 공통 CSS 링크
  - 필요한 JS만 로드
  - 공통 네비게이션 포함
```

### Migration Strategy

1. **Phase 1: 페이지 분리**
   - 각 유틸리티를 독립 HTML 파일로 추출
   - 공통 헤더/네비게이션 구조 정의

2. **Phase 2: 라우팅 제거**
   - router.js 제거
   - `<a>` 태그로 페이지 링크 변경

3. **Phase 3: 검증 및 최적화**
   - Playwright 테스트 업데이트
   - 성능 및 접근성 검증

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 페이지 간 공통 UI 중복 | Medium | 템플릿화 또는 서버 사이드 인클루드 검토 |
| 캐시 효율성 저하 | Low | 브라우저 캐싱 활용, 공통 리소스 분리 |
| GitHub Pages 라우팅 | Low | 상대 경로 사용, 404.html 설정 |

## References

- [MDN: Traditional vs SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Project Constitution: `.specify/memory/constitution.md`
