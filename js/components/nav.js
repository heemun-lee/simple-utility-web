/**
 * Navigation Component
 * Template literal 기반 네비게이션 메뉴 렌더링
 */

import { loadMenuData } from '../utils/menu-loader.js';

/**
 * 네비게이션 HTML 렌더링
 * @param {string} currentPageId - 현재 페이지 ID (활성 표시용)
 * @returns {Promise<string>} 네비게이션 HTML 문자열
 */
export async function renderNavigation(currentPageId) {
  const menuData = await loadMenuData();

  // order 기준 정렬
  const sortedItems = menuData.items.sort((a, b) => a.order - b.order);

  // 메뉴 항목 HTML 생성
  const navItems = sortedItems
    .map(item => {
      const isActive = item.id === currentPageId;
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      const icon = item.icon || '';

      return `
        <li class="nav-item">
          <a href="${item.path}"${ariaCurrent}>
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
