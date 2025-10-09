/**
 * Error Display Component
 * Toast 형태의 에러 메시지 표시
 */

/**
 * 에러 메시지 표시
 * @param {Object} errorInfo - 에러 정보
 * @param {string} errorInfo.type - 'warning' | 'error' | 'info'
 * @param {string} errorInfo.message - 에러 메시지
 * @param {number} errorInfo.duration - 표시 시간 (ms), 기본 5000
 */
export function showError({ type = 'error', message, duration = 5000 }) {
  // Toast UI 생성
  const toast = document.createElement('div');
  toast.className = `error-toast error-toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  toast.innerHTML = `
    <p class="error-message">${escapeHtml(message)}</p>
    <button class="error-close" aria-label="닫기">×</button>
  `;

  // DOM에 추가
  document.body.appendChild(toast);

  // 닫기 버튼 이벤트
  const closeBtn = toast.querySelector('.error-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // 자동 제거
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
}

/**
 * Toast 제거 (애니메이션 포함)
 * @param {HTMLElement} toast - Toast 엘리먼트
 */
function removeToast(toast) {
  toast.style.animation = 'slideOut 0.3s ease-in';
  toast.addEventListener('animationend', () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  });
}

/**
 * HTML 이스케이프 (XSS 방지)
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// slideOut 애니메이션 추가 (components.css에 없을 경우 대비)
if (!document.getElementById('error-toast-animations')) {
  const style = document.createElement('style');
  style.id = 'error-toast-animations';
  style.textContent = `
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
