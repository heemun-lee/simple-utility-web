import { test, expect } from '@playwright/test';

test.describe('게이지 변환기 네비게이션', () => {
  test('홈에서 게이지 변환기로 이동한다', async ({ page }) => {
    // 홈 페이지로 이동
    await page.goto('/');

    // 네비게이션의 게이지 변환기 링크 클릭
    const gaugeLink = page.locator('.nav-item a[href="/pages/knitting-tools/gauge-tools/index.html"]');
    await expect(gaugeLink).toBeVisible();
    await gaugeLink.click();

    // URL 검증
    await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);

    // 페이지 로드 확인
    await expect(page.locator('h1')).toBeVisible();
  });

  test('게이지 변환기 페이지에 직접 접속한다', async ({ page }) => {
    // 직접 URL 접속
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');

    // 페이지 제목 확인
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('게이지 변환');
  });

  test('게이지 변환기가 네비게이션에서 활성 상태로 표시된다', async ({ page }) => {
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');

    // 활성 링크 확인
    const activeLink = page.locator('a[aria-current="page"]');
    await expect(activeLink).toBeVisible();
    await expect(activeLink).toContainText('게이지 변환');
  });

  test('게이지 변환기에서 홈으로 돌아간다', async ({ page }) => {
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');

    // 홈 링크 클릭
    const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
    await homeLink.click();

    // 홈 페이지로 이동 확인
    await expect(page).toHaveURL(/.*index\.html$/);
  });
});
