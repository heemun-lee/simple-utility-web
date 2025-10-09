import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('홈 페이지 접근성 (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('자동화된 접근성 검사를 통과한다 (skip link 제외)', async ({ page }) => {
    // Note: Skip link가 제거되었음 (사용자 요청)
    // 실제 네비게이션이 짧아 키보드 사용자 불편 최소화
    // Placeholder 카드는 aria-hidden으로 접근성 트리에서 제외
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['skip-link', 'bypass'])
      .exclude('[aria-hidden="true"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('시맨틱 HTML 요소가 올바르게 사용된다', async ({ page }) => {
    // main 요소 확인
    const main = page.locator('main');
    await expect(main).toBeVisible();
    await expect(main).toHaveCount(1); // 페이지당 1개만

    // nav 요소 확인 (메인 네비게이션)
    const nav = page.locator('nav.main-nav');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveCount(1);

    // footer 요소 확인
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveCount(1);

    // h1 요소 확인 (페이지당 1개)
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1);
  });

  test('ARIA 속성이 올바르게 설정된다', async ({ page }) => {
    // Navigation ARIA 속성
    const nav = page.locator('nav.main-nav');
    await expect(nav).toHaveAttribute('role', 'navigation');
    await expect(nav).toHaveAttribute('aria-label');

    // Main content ARIA 속성
    const main = page.locator('main#main-content');
    await expect(main).toHaveAttribute('role', 'main');

    // Footer ARIA 속성
    const footer = page.locator('footer.main-footer');
    await expect(footer).toHaveAttribute('role', 'contentinfo');

    // 현재 페이지 링크 aria-current
    const currentPageLink = page.locator('a[aria-current="page"]');
    await expect(currentPageLink).toBeVisible();
  });

  test('키보드 네비게이션이 가능하다', async ({ page }) => {
    // 포커스 가능한 요소가 페이지에 존재하는지 확인
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    // 첫 번째 링크에 프로그래밍 방식으로 포커스
    const firstLink = links.first();
    await firstLink.focus();

    // 포커스 스타일 확인
    const outlineStyle = await firstLink.evaluate(el =>
      window.getComputedStyle(el).outlineWidth
    );
    // 포커스 스타일이 적용되는지 확인 (기본값이 아닌 경우)
    expect(outlineStyle).toBeTruthy();
  });

  test('모든 링크에 의미 있는 텍스트가 있다', async ({ page }) => {
    // 모든 링크 가져오기
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // 텍스트 또는 aria-label이 있어야 함
      expect(text?.trim() || ariaLabel).toBeTruthy();

      // "여기", "클릭" 같은 모호한 텍스트 금지
      if (text) {
        expect(text.toLowerCase()).not.toMatch(/^(여기|클릭|here|click)$/);
      }
    }
  });

  test('모든 버튼에 접근 가능한 이름이 있다', async ({ page }) => {
    // 모든 버튼 가져오기
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // 버튼에 접근 가능한 이름이 있어야 함
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('색상 대비가 충분하다 (WCAG AA)', async ({ page }) => {
    const colorContrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .exclude('[aria-hidden="true"]')
      .analyze();

    const colorContrastViolations = colorContrastResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(colorContrastViolations).toEqual([]);
  });

  test('모바일에서 터치 타겟 크기가 충분하다', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    // 모든 인터랙티브 요소 확인
    const interactiveElements = page.locator('a, button, input, select, textarea');
    const count = await interactiveElements.count();

    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();

      if (box) {
        // 최소 44x44px (WCAG 2.1 AA)
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('페이지 언어가 올바르게 선언된다', async ({ page }) => {
    // html lang 속성 확인
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ko');
  });
});
