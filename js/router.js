/**
 * SPA Router
 * @module router
 */

import { $, showError } from './utils.js';

/**
 * 페이지 캐시 (Map 기반)
 * @type {Map<string, string>}
 */
const pageCache = new Map();

/**
 * 현재 로드된 페이지 URL
 * @type {string}
 */
let currentPath = '';

/**
 * 페이지로 이동
 * @param {string} url - 이동할 페이지 URL
 * @returns {Promise<void>}
 */
export const navigateTo = async (url) => {
  if (url === currentPath) return;

  // GitHub Pages 서브디렉토리 처리를 위한 base path
  const basePath = location.pathname.includes('/simple-utility-web/') ? '/simple-utility-web/' : '/';
  const fullUrl = url.startsWith('/') ? url : basePath + url;

  history.pushState(null, '', fullUrl);
  await loadPage(url);
};

/**
 * 페이지 로드
 * @param {string} url - 로드할 페이지 URL
 * @returns {Promise<void>}
 */
const loadPage = async (url) => {
  const contentContainer = $('#content');

  if (!contentContainer) {
    console.error('Content container not found');
    return;
  }

  // 캐시 확인
  if (pageCache.has(url)) {
    contentContainer.innerHTML = pageCache.get(url);
    currentPath = url;
    executePageScripts(contentContainer);
    updateActiveMenu(url);
    return;
  }

  try {
    // 페이지 가져오기 - 상대 경로를 루트 기준 절대 경로로 변환
    const fetchUrl = url.startsWith('/') ? url : '/' + url;
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 캐시 저장
    pageCache.set(url, html);

    // 콘텐츠 표시
    contentContainer.innerHTML = html;
    currentPath = url;

    // 페이지 스크립트 실행
    executePageScripts(contentContainer);

    // 활성 메뉴 업데이트
    updateActiveMenu(url);
  } catch (error) {
    console.error('Page load error:', error);
    contentContainer.innerHTML = `
      <article>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>요청하신 페이지를 로드할 수 없습니다.</p>
        <p class="error">${error.message}</p>
        <button onclick="window.location.href='/'">홈으로 돌아가기</button>
      </article>
    `;
  }
};

/**
 * 페이지 내 스크립트 실행
 * @param {Element} container - 스크립트가 포함된 컨테이너
 */
const executePageScripts = (container) => {
  const scripts = container.querySelectorAll('script');

  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script');

    // 속성 복사
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    // 인라인 스크립트 복사
    if (oldScript.textContent) {
      newScript.textContent = oldScript.textContent;
    }

    // 스크립트 교체 (실행 트리거)
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
};

/**
 * 활성 메뉴 업데이트
 * @param {string} url - 현재 페이지 URL
 */
const updateActiveMenu = (url) => {
  // 기존 활성 메뉴 제거
  const activeMenus = document.querySelectorAll('.menu-current');
  activeMenus.forEach((menu) => menu.classList.remove('menu-current'));

  // 현재 URL과 일치하는 메뉴 활성화
  const currentMenu = document.querySelector(`[data-url="${url}"]`);
  if (currentMenu) {
    currentMenu.closest('li').classList.add('menu-current');
  }
};

/**
 * 페이지 캐시 초기화
 */
export const clearPageCache = () => {
  pageCache.clear();
  console.log('Page cache cleared');
};

/**
 * 현재 페이지 URL 반환
 * @returns {string} 현재 페이지 URL
 */
export const getCurrentPath = () => currentPath;

/**
 * 초기화
 */
const init = () => {
  // 브라우저 뒤로가기/앞으로가기 처리
  window.addEventListener('popstate', () => {
    loadPage(location.pathname);
  });

  // 초기 페이지 로드
  const initialPath = location.pathname === '/' || location.pathname === '/simple-utility-web/' || location.pathname === '/simple-utility-web'
    ? 'pages/home.html'
    : location.pathname;

  loadPage(initialPath);
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
