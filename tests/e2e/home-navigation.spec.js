import { test, expect } from '@playwright/test';

test.describe('홈 페이지 네비게이션', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('네비게이션 메뉴가 렌더링된다', async ({ page }) => {
    // 네비게이션 메뉴 존재 확인
    const nav = page.locator('nav.main-nav');
    await expect(nav).toBeVisible();

    // 네비게이션 역할 속성 확인
    await expect(nav).toHaveAttribute('role', 'navigation');
    await expect(nav).toHaveAttribute('aria-label', '주요 메뉴');

    // 메뉴 리스트 존재 확인
    const navList = page.locator('.nav-list');
    await expect(navList).toBeVisible();

    // 최소 1개 이상의 메뉴 항목 존재
    const navItems = page.locator('.nav-item');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('홈 페이지가 활성 상태로 표시된다', async ({ page }) => {
    // aria-current="page" 속성을 가진 링크 확인
    const activeLink = page.locator('a[aria-current="page"]');
    await expect(activeLink).toBeVisible();

    // 홈 링크가 활성화되어 있는지 확인
    const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
    await expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  test('푸터가 렌더링된다', async ({ page }) => {
    // 푸터 존재 확인
    const footer = page.locator('footer.main-footer');
    await expect(footer).toBeVisible();

    // 푸터 역할 속성 확인
    await expect(footer).toHaveAttribute('role', 'contentinfo');

    // 저작권 정보 확인
    const copyright = page.locator('.copyright');
    await expect(copyright).toBeVisible();

    const currentYear = new Date().getFullYear();
    await expect(copyright).toContainText(currentYear.toString());
    await expect(copyright).toContainText('Simple Utility Web');
  });

  test('모바일 메뉴 토글이 동작한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 햄버거 메뉴 버튼 존재 확인
    const toggleButton = page.locator('.nav-toggle');
    await expect(toggleButton).toBeVisible();

    // 초기 상태: aria-expanded="false"
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // 메뉴 클릭
    await toggleButton.click();

    // 클릭 후: aria-expanded="true"
    await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // 메뉴 리스트가 활성화됨
    const navList = page.locator('.nav-list');
    await expect(navList).toHaveClass(/active/);
  });

  test('네비게이션 링크가 올바른 경로를 가진다', async ({ page }) => {
    // 홈 링크 확인
    const homeLink = page.locator('.nav-item a').filter({ hasText: '홈' });
    await expect(homeLink).toHaveAttribute('href', '/index.html');

    // 모든 링크가 절대 경로를 사용하는지 확인
    const allLinks = page.locator('.nav-item a');
    const count = await allLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/.*\.html$/);
    }
  });
});
