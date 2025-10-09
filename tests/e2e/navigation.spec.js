import { test, expect } from '@playwright/test';

test.describe('페이지 간 네비게이션', () => {
  test.describe('홈에서 다른 페이지로 이동', () => {
    test('홈에서 게이지 변환기로 네비게이션 링크를 통해 이동한다', async ({ page }) => {
      await page.goto('/');

      const gaugeLink = page.locator('.nav-item a').filter({ hasText: '게이지 변환' });
      await expect(gaugeLink).toBeVisible();

      await gaugeLink.click();

      await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);
      await expect(page.locator('h1')).toContainText('게이지 변환');
    });

    test('홈에서 게이지 변환기로 카드 링크를 통해 이동한다', async ({ page }) => {
      await page.goto('/');

      const gaugeCard = page.locator('.utility-card').filter({
        hasText: '게이지 변환'
      });
      await expect(gaugeCard).toBeVisible();

      const cardLink = gaugeCard.locator('a').first();
      await cardLink.click();

      await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);
      await expect(page.locator('h1')).toContainText('게이지 변환');
    });
  });

  test.describe('게이지 변환기에서 홈으로 이동', () => {
    test('게이지 변환기에서 홈 링크를 클릭하여 돌아간다', async ({ page }) => {
      await page.goto('/pages/knitting-tools/gauge-tools/index.html');

      const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
      await expect(homeLink).toBeVisible();

      await homeLink.click();

      await expect(page).toHaveURL(/.*\/(index\.html)?$/);
      await expect(page.locator('h1')).toContainText('Simple Utility Web');
    });
  });

  test.describe('직접 URL 접속', () => {
    test('게이지 변환기 페이지에 직접 접속할 수 있다', async ({ page }) => {
      await page.goto('/pages/knitting-tools/gauge-tools/index.html');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText('게이지 변환');

      // 네비게이션이 올바르게 로드되었는지 확인
      const nav = page.locator('nav.main-nav');
      await expect(nav).toBeVisible();
    });

    test('홈 페이지에 직접 접속할 수 있다', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText('Simple Utility Web');

      const nav = page.locator('nav.main-nav');
      await expect(nav).toBeVisible();
    });
  });

  test.describe('페이지 새로고침', () => {
    test('홈 페이지 새로고침이 정상 작동한다', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('Simple Utility Web');

      await page.reload();

      await expect(page).toHaveURL(/.*\/(index\.html)?$/);
      await expect(page.locator('h1')).toContainText('Simple Utility Web');
    });

    test('게이지 변환기 페이지 새로고침이 정상 작동한다', async ({ page }) => {
      await page.goto('/pages/knitting-tools/gauge-tools/index.html');
      await expect(page.locator('h1')).toContainText('게이지 변환');

      await page.reload();

      await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);
      await expect(page.locator('h1')).toContainText('게이지 변환');
    });
  });

  test.describe('활성 상태 표시', () => {
    test('홈 페이지에서 홈 링크가 활성화된다', async ({ page }) => {
      await page.goto('/');

      const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
      await expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    test('게이지 변환기에서 게이지 링크가 활성화된다', async ({ page }) => {
      await page.goto('/pages/knitting-tools/gauge-tools/index.html');

      const gaugeLink = page.locator('.nav-item a').filter({ hasText: '게이지 변환' });
      await expect(gaugeLink).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('전체 페이지 로드 확인', () => {
    test('페이지 이동 시 전체 페이지가 로드된다 (SPA가 아님)', async ({ page }) => {
      await page.goto('/');

      let pageLoadCount = 0;
      page.on('load', () => {
        pageLoadCount++;
      });

      const gaugeLink = page.locator('.nav-item a').filter({ hasText: '게이지 변환' });
      await gaugeLink.click();

      await page.waitForLoadState('load');
      await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);

      expect(pageLoadCount).toBeGreaterThan(0);
    });
  });
});
