/**
 * Menu Loader Utility
 * menu.json 로드 및 캐싱
 */

let cachedMenuData = null;

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
 * depth에 따라 menu.json 경로 생성
 * @returns {string} menu.json 경로
 */
function getMenuPath() {
  const depth = getPageDepth();
  if (depth === 0) {
    return './data/menu.json';
  }
  const prefix = '../'.repeat(depth);
  return `${prefix}data/menu.json`;
}

/**
 * 메뉴 데이터 로드
 * @returns {Promise<Object>} 메뉴 데이터
 */
export async function loadMenuData() {
  // 캐시된 데이터 반환
  if (cachedMenuData) {
    return cachedMenuData;
  }

  try {
    const menuPath = getMenuPath();
    const response = await fetch(menuPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 데이터 검증
    if (!data.version || !Array.isArray(data.items)) {
      throw new Error('Invalid menu data structure');
    }

    // 캐싱
    cachedMenuData = data;
    return data;
  } catch (error) {
    console.error('Menu data load failed:', error);
    return getDefaultMenuData();
  }
}

/**
 * 기본 메뉴 데이터 반환 (Fallback)
 * @returns {Object} 기본 메뉴 데이터
 */
function getDefaultMenuData() {
  return {
    version: '2.0',
    items: [
      {
        id: 'home',
        label: '홈',
        path: './index.html',
        category: 'main',
        order: 1,
        icon: '🏠'
      }
    ],
    categories: [
      {
        id: 'main',
        label: '메인',
        order: 1
      }
    ]
  };
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearMenuCache() {
  cachedMenuData = null;
}
