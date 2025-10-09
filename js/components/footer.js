/**
 * Footer Component
 * 공통 푸터 렌더링
 */

/**
 * 푸터 HTML 렌더링
 * @returns {string} 푸터 HTML 문자열
 */
export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="main-footer" role="contentinfo">
      <div class="footer-content">
        <p class="copyright">
          © ${currentYear} Simple Utility Web. All rights reserved.
        </p>
        <nav class="footer-links" aria-label="바닥글 링크">
          <a href="https://github.com/hmlee" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  `;
}
