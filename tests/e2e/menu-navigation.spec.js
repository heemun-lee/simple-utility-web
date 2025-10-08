import { test, expect } from '@playwright/test';

test.describe('메뉴 네비게이션 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('메뉴를 통한 페이지 이동', async ({ page }) => {
    // 메뉴 네비게이션
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('게이지 변환 계산기');
  });

  test('모바일 햄버거 메뉴', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 햄버거 메뉴 버튼 확인
    const menuToggle = page.locator('.menu-toggle');
    await expect(menuToggle).toBeVisible();

    // 메뉴 열기
    await menuToggle.click();

    // 메뉴 표시 확인
    await expect(page.locator('text=편물 도구')).toBeVisible();

    // 메뉴 항목 클릭
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 이동 확인
    await expect(page.locator('h1')).toContainText('게이지 변환 계산기');
  });

  test('메뉴 ARIA 속성', async ({ page }) => {
    // 메뉴 role 확인
    const menu = page.locator('.menu-depth-0');
    const menuRole = await menu.getAttribute('role');
    expect(menuRole).toBe('menubar');

    // 메뉴 버튼 aria-haspopup 확인
    const menuButton = page.locator('text=편물 도구');
    const hasPopup = await menuButton.getAttribute('aria-haspopup');
    expect(hasPopup).toBe('true');
  });
});
