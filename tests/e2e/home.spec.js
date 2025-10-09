import { test, expect } from '@playwright/test';

test.describe('홈 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('페이지 구조', () => {
    test('시맨틱 HTML 요소가 올바르게 사용된다', async ({ page }) => {
      // main 요소 확인
      const main = page.locator('main');
      await expect(main).toBeVisible();
      await expect(main).toHaveCount(1);

      // nav 요소 확인
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
      await expect(h1).toContainText('Simple Utility Web');
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

    test('메타 태그가 올바르게 설정된다', async ({ page }) => {
      // 페이지 타이틀
      await expect(page).toHaveTitle(/Simple Utility Web/);

      // 메타 description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveCount(1);
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(10);

      // 뷰포트 메타 태그
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
      const viewportContent = await viewport.getAttribute('content');
      expect(viewportContent).toContain('width=device-width');
      expect(viewportContent).toContain('initial-scale=1.0');

      // 페이지 언어
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('ko');
    });
  });

  test.describe('네비게이션', () => {
    test('네비게이션 메뉴가 렌더링된다', async ({ page }) => {
      const nav = page.locator('nav.main-nav');
      await expect(nav).toBeVisible();
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(nav).toHaveAttribute('aria-label', '주요 메뉴');

      const navList = page.locator('.nav-list');
      await expect(navList).toBeVisible();

      const navItems = page.locator('.nav-item');
      const count = await navItems.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('홈 페이지가 활성 상태로 표시된다', async ({ page }) => {
      const activeLink = page.locator('a[aria-current="page"]');
      await expect(activeLink).toBeVisible();

      const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
      await expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    test('네비게이션 링크가 올바른 경로를 가진다', async ({ page }) => {
      const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
      await expect(homeLink).toHaveAttribute('href', './index.html');

      const allLinks = page.locator('.nav-item a');
      const count = await allLinks.count();

      for (let i = 0; i < count; i++) {
        const href = await allLinks.nth(i).getAttribute('href');
        expect(href).toMatch(/^\.\.?\/.*\.html$/);
      }
    });

    test('모바일 메뉴 토글이 동작한다', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const toggleButton = page.locator('.nav-toggle');
      await expect(toggleButton).toBeVisible();
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      await toggleButton.click();
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      const navList = page.locator('.nav-list');
      await expect(navList).toHaveClass(/active/);
    });
  });

  test.describe('콘텐츠', () => {
    test('Hero 섹션이 표시된다', async ({ page }) => {
      const hero = page.locator('.hero, header.hero, section.hero').first();
      await expect(hero).toBeVisible();

      const heroTitle = hero.locator('h1');
      await expect(heroTitle).toBeVisible();

      const heroDescription = hero.locator('p');
      await expect(heroDescription).toBeVisible();
    });

    test('유틸리티 카드가 표시된다', async ({ page }) => {
      const cards = page.locator('.utility-card, .card, article').filter({
        hasText: /게이지|변환|계산/
      });
      await expect(cards.first()).toBeVisible();
    });

    test('유틸리티 카드의 링크가 올바르다', async ({ page }) => {
      const gaugeCard = page.locator('.utility-card').filter({
        hasText: '게이지 변환'
      });
      await expect(gaugeCard).toBeVisible();

      const cardLink = gaugeCard.locator('a').first();
      await expect(cardLink).toBeVisible();
      await expect(cardLink).toHaveAttribute('href', './pages/knitting-tools/gauge-tools/index.html');
    });
  });

  test.describe('푸터', () => {
    test('푸터가 렌더링된다', async ({ page }) => {
      const footer = page.locator('footer.main-footer');
      await expect(footer).toBeVisible();
      await expect(footer).toHaveAttribute('role', 'contentinfo');

      const copyright = page.locator('.copyright');
      await expect(copyright).toBeVisible();

      const currentYear = new Date().getFullYear();
      await expect(copyright).toContainText(currentYear.toString());
      await expect(copyright).toContainText('Simple Utility Web');
    });
  });

  test.describe('접근성', () => {
    test('키보드 네비게이션이 가능하다', async ({ page }) => {
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);

      const firstLink = links.first();
      await firstLink.focus();

      const outlineStyle = await firstLink.evaluate(el =>
        window.getComputedStyle(el).outlineWidth
      );
      expect(outlineStyle).toBeTruthy();
    });

    test('모든 링크에 의미 있는 텍스트가 있다', async ({ page }) => {
      const links = page.locator('a');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        expect(text?.trim() || ariaLabel).toBeTruthy();

        if (text) {
          expect(text.toLowerCase()).not.toMatch(/^(여기|클릭|here|click)$/);
        }
      }
    });
  });
});
