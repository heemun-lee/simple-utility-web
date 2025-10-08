/**
 * Menu Management
 * @module menu
 */

import { $, $$, on, createElement, toggleClass } from './utils.js';
import { navigateTo } from './router.js';

/**
 * 메뉴 데이터
 * @type {Object|null}
 */
let menuData = null;

/**
 * 메뉴 렌더링
 * @param {Array} items - 메뉴 아이템 배열
 * @param {number} [depth=0] - 메뉴 깊이
 * @returns {Element} 메뉴 ul 요소
 */
const renderMenu = (items, depth = 0) => {
  const ul = createElement('ul', {
    className: `menu-depth-${depth}`,
    role: depth === 0 ? 'menubar' : 'menu',
  });

  items.forEach((item) => {
    const li = createElement('li', {
      role: 'none',
      className: item.children ? 'menu-item-has-children' : '',
    });

    const button = createElement(
      'button',
      {
        type: 'button',
        role: depth === 0 ? 'menuitem' : 'menuitem',
        'aria-haspopup': item.children ? 'true' : 'false',
        'aria-expanded': 'false',
        ...(item.url && { 'data-url': item.url }),
      },
      item.title
    );

    // 버튼 클릭 이벤트
    if (item.url) {
      // 3depth - 페이지 이동
      on(button, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateTo(item.url);
        closeMobileMenu();
      });
    } else if (item.children) {
      // 1depth, 2depth - 서브메뉴 토글
      on(button, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSubmenu(li, button);
      });
    }

    li.appendChild(button);

    // 서브메뉴가 있는 경우
    if (item.children) {
      const submenu = renderMenu(item.children, depth + 1);
      li.appendChild(submenu);

      // 데스크톱 호버 이벤트
      if (window.innerWidth >= 1024) {
        on(li, 'mouseenter', () => {
          showSubmenu(submenu, button);
        });

        on(li, 'mouseleave', () => {
          hideSubmenu(submenu, button);
        });
      }
    }

    ul.appendChild(li);
  });

  return ul;
};

/**
 * 서브메뉴 토글
 * @param {Element} li - 메뉴 아이템 li
 * @param {Element} button - 메뉴 버튼
 */
const toggleSubmenu = (li, button) => {
  const submenu = li.querySelector('.menu-depth-1, .menu-depth-2');
  if (!submenu) return;

  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  if (isExpanded) {
    hideSubmenu(submenu, button);
    li.classList.remove('active');
  } else {
    // 다른 서브메뉴 닫기
    closeOtherSubmenus(li);
    showSubmenu(submenu, button);
    li.classList.add('active');
  }
};

/**
 * 서브메뉴 표시
 * @param {Element} submenu - 서브메뉴 요소
 * @param {Element} button - 메뉴 버튼
 */
const showSubmenu = (submenu, button) => {
  submenu.classList.add('show');
  button.setAttribute('aria-expanded', 'true');
};

/**
 * 서브메뉴 숨김
 * @param {Element} submenu - 서브메뉴 요소
 * @param {Element} button - 메뉴 버튼
 */
const hideSubmenu = (submenu, button) => {
  submenu.classList.remove('show');
  button.setAttribute('aria-expanded', 'false');
};

/**
 * 다른 서브메뉴 닫기
 * @param {Element} currentLi - 현재 메뉴 아이템
 */
const closeOtherSubmenus = (currentLi) => {
  const parent = currentLi.parentElement;
  const siblings = parent.querySelectorAll(':scope > li');

  siblings.forEach((li) => {
    if (li !== currentLi) {
      const submenu = li.querySelector('.menu-depth-1, .menu-depth-2');
      const button = li.querySelector('button');
      if (submenu && button) {
        hideSubmenu(submenu, button);
        li.classList.remove('active');
      }
    }
  });
};

/**
 * 모바일 메뉴 토글 버튼 생성
 * @returns {Element} 토글 버튼
 */
const createMobileToggle = () => {
  const toggle = createElement(
    'button',
    {
      className: 'menu-toggle',
      type: 'button',
      'aria-label': '메뉴 열기',
      'aria-expanded': 'false',
      'aria-controls': 'main-menu',
    },
    [
      createElement('span'),
      createElement('span'),
      createElement('span'),
    ]
  );

  on(toggle, 'click', () => {
    const menu = $('.menu-depth-0');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  return toggle;
};

/**
 * 모바일 메뉴 열기
 */
const openMobileMenu = () => {
  const toggle = $('.menu-toggle');
  const menu = $('.menu-depth-0');

  if (toggle && menu) {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
    menu.classList.add('show');
    menu.id = 'main-menu';
  }
};

/**
 * 모바일 메뉴 닫기
 */
const closeMobileMenu = () => {
  const toggle = $('.menu-toggle');
  const menu = $('.menu-depth-0');

  if (toggle && menu) {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    menu.classList.remove('show');
  }
};

/**
 * 메뉴 데이터 로드
 * @returns {Promise<void>}
 */
const loadMenu = async () => {
  try {
    const response = await fetch('data/menu.json');

    if (!response.ok) {
      throw new Error(`Failed to load menu: ${response.statusText}`);
    }

    menuData = await response.json();

    const menuContainer = $('#menu-container');

    if (!menuContainer) {
      console.error('Menu container not found');
      return;
    }

    // 모바일 토글 버튼 추가
    const mobileToggle = createMobileToggle();
    menuContainer.appendChild(mobileToggle);

    // 메뉴 렌더링
    const menu = renderMenu(menuData.menu);
    menuContainer.appendChild(menu);

    // 윈도우 리사이즈 이벤트
    let resizeTimeout;
    on(window, 'resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // 데스크톱 전환 시 모바일 메뉴 닫기
        if (window.innerWidth >= 768) {
          closeMobileMenu();
        }
      }, 250);
    });
  } catch (error) {
    console.error('Menu load error:', error);
  }
};

/**
 * 키보드 네비게이션 처리
 */
const initKeyboardNavigation = () => {
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      // ESC 키로 모든 서브메뉴 닫기
      const openSubmenus = $$('.menu-depth-1.show, .menu-depth-2.show');
      openSubmenus.forEach((submenu) => {
        const button = submenu.previousElementSibling;
        hideSubmenu(submenu, button);
        submenu.closest('li').classList.remove('active');
      });

      // 모바일 메뉴 닫기
      closeMobileMenu();
    }
  });
};

/**
 * 초기화
 */
const init = () => {
  loadMenu();
  initKeyboardNavigation();
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { loadMenu, closeMobileMenu };
