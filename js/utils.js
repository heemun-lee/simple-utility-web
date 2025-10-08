/**
 * Utility Functions
 * @module utils
 */

/**
 * DOM 선택자 헬퍼
 * @param {string} selector - CSS 선택자
 * @param {Element} [context=document] - 검색 컨텍스트
 * @returns {Element|null} 찾은 요소 또는 null
 */
export const $ = (selector, context = document) => {
  return context.querySelector(selector);
};

/**
 * DOM 다중 선택자 헬퍼
 * @param {string} selector - CSS 선택자
 * @param {Element} [context=document] - 검색 컨텍스트
 * @returns {NodeList} 찾은 요소들의 NodeList
 */
export const $$ = (selector, context = document) => {
  return context.querySelectorAll(selector);
};

/**
 * 이벤트 리스너 추가 헬퍼
 * @param {Element|Window|Document} element - 대상 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} [options] - 이벤트 옵션
 */
export const on = (element, event, handler, options = {}) => {
  if (element && typeof element.addEventListener === 'function') {
    element.addEventListener(event, handler, options);
  }
};

/**
 * 이벤트 리스너 제거 헬퍼
 * @param {Element|Window|Document} element - 대상 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 */
export const off = (element, event, handler) => {
  if (element && typeof element.removeEventListener === 'function') {
    element.removeEventListener(event, handler);
  }
};

/**
 * 이벤트 위임 헬퍼
 * @param {Element} parent - 부모 요소
 * @param {string} event - 이벤트 타입
 * @param {string} selector - 자식 선택자
 * @param {Function} handler - 이벤트 핸들러
 */
export const delegate = (parent, event, selector, handler) => {
  on(parent, event, (e) => {
    const target = e.target.closest(selector);
    if (target) {
      handler.call(target, e);
    }
  });
};

/**
 * 클래스 토글 헬퍼
 * @param {Element} element - 대상 요소
 * @param {string} className - 클래스명
 * @param {boolean} [force] - 강제 추가/제거
 * @returns {boolean} 토글 결과
 */
export const toggleClass = (element, className, force) => {
  if (!element) return false;
  return element.classList.toggle(className, force);
};

/**
 * HTML 요소 생성 헬퍼
 * @param {string} tag - 태그명
 * @param {Object} [attrs] - 속성 객체
 * @param {string|Element|Element[]} [children] - 자식 요소
 * @returns {Element} 생성된 요소
 */
export const createElement = (tag, attrs = {}, children = null) => {
  const element = document.createElement(tag);

  // 속성 설정
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // 자식 요소 추가
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else if (children instanceof Element) {
      element.appendChild(children);
    }
  }

  return element;
};

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간(ms)
 * @returns {Function} 디바운스된 함수
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 쓰로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {Function} 쓰로틀된 함수
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 에러 메시지 표시
 * @param {Element} container - 표시할 컨테이너
 * @param {string} message - 에러 메시지
 */
export const showError = (container, message) => {
  if (!container) return;

  const errorDiv = createElement(
    'div',
    { className: 'error', role: 'alert' },
    message
  );

  container.innerHTML = '';
  container.appendChild(errorDiv);

  // 5초 후 자동 제거
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
};

/**
 * 성공 메시지 표시
 * @param {Element} container - 표시할 컨테이너
 * @param {string} message - 성공 메시지
 */
export const showSuccess = (container, message) => {
  if (!container) return;

  const successDiv = createElement(
    'div',
    { className: 'success', role: 'status' },
    message
  );

  container.innerHTML = '';
  container.appendChild(successDiv);

  // 3초 후 자동 제거
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.remove();
    }
  }, 3000);
};

/**
 * 로컬 스토리지 헬퍼
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
};
