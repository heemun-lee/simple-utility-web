/**
 * Navigation Component
 * Template literal 기반 네비게이션 메뉴 렌더링
 */

import { loadMenuData } from '../utils/menu-loader.js';

/**
 * 현재 페이지의 depth 계산 (프로젝트 root로부터의 깊이)
 * @returns {number} 페이지 depth
 */
function getPageDepth() {
  const pathname = window.location.pathname;
  // Remove trailing /index.html or .html
  const pathWithoutFile = pathname.replace(/\/[^\/]+\.html$/, '');
  // Split and filter empty parts
  const parts = pathWithoutFile.split('/').filter(p => p);
  // If first part is project name (for GitHub Pages), remove it
  if (parts.length > 0 && parts[0] === 'simple-utility-web') {
    parts.shift();
  }
  return parts.length;
}

/**
 * 현재 페이지 depth에 맞게 경로 조정
 * @param {string} path - 원본 경로
 * @param {number} depth - 현재 페이지 depth
 * @returns {string} 조정된 경로
 */
function adjustPath(path, depth) {
  // ./로 시작하는 상대 경로를 depth에 맞게 조정
  if (path.startsWith('./')) {
    if (depth === 0) {
      // 홈페이지(depth 0)에서는 원본 경로 그대로 사용
      return path;
    }
    // 하위 페이지에서는 ../ 추가
    const prefix = '../'.repeat(depth);
    return prefix + path.substring(2);
  }
  return path;
}

/**
 * 네비게이션 HTML 렌더링
 * @param {string} currentPageId - 현재 페이지 ID (활성 표시용)
 * @returns {Promise<string>} 네비게이션 HTML 문자열
 */
export async function renderNavigation(currentPageId) {
  const menuData = await loadMenuData();
  const depth = getPageDepth();

  // order 기준 정렬
  const sortedItems = menuData.items.sort((a, b) => a.order - b.order);

  // 메뉴 항목 HTML 생성
  const navItems = sortedItems
    .map(item => {
      const isActive = item.id === currentPageId;
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      const icon = item.icon || '';
      const adjustedPath = adjustPath(item.path, depth);

      return `
        <li class="nav-item">
          <a href="${adjustedPath}"${ariaCurrent}>
            ${icon} ${item.label}
          </a>
        </li>
      `;
    })
    .join('');

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
}

/**
 * 모바일 메뉴 토글 이벤트 리스너 추가
 * 페이지 로드 후 호출 필요
 */
export function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');

  if (!toggle || !navList) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isExpanded = navList.classList.contains('active');
    navList.classList.toggle('active');
    toggle.setAttribute('aria-expanded', !isExpanded);
    toggle.setAttribute('aria-label', isExpanded ? '메뉴 열기' : '메뉴 닫기');
  });

  // 메뉴 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.main-nav')) {
      navList.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
    }
  });
}
