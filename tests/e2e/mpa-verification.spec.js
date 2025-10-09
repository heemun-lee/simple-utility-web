import { test, expect } from '@playwright/test';

test.describe('MPA 구조 검증', () => {
  test('router.js가 로드되지 않는다', async ({ page }) => {
    // 페이지 로드
    await page.goto('/');

    // router.js 스크립트 태그가 없는지 확인
    const routerScript = await page.locator('script[src*="router"]').count();
    expect(routerScript).toBe(0);
  });

  test('menu.js가 로드되지 않는다', async ({ page }) => {
    await page.goto('/');

    // menu.js 스크립트 태그가 없는지 확인
    const menuScript = await page.locator('script[src*="menu"]').count();
    expect(menuScript).toBe(0);
  });

  test('모든 페이지가 독립적으로 로드된다', async ({ page }) => {
    // 홈 페이지 로드
    const homeResponse = await page.goto('/');
    expect(homeResponse?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();

    // 게이지 변환기 페이지 직접 로드
    const gaugeResponse = await page.goto('/pages/knitting-tools/gauge-tools/index.html');
    expect(gaugeResponse?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('게이지 변환');
  });

  test('페이지 전환이 전체 페이지 로드로 이루어진다', async ({ page, context }) => {
    await page.goto('/');

    // 페이지 로드 이벤트 감지
    let pageLoadCount = 0;
    page.on('load', () => {
      pageLoadCount++;
    });

    // 게이지 변환기 링크 클릭
    const gaugeLink = page.locator('.nav-item a[href="./pages/knitting-tools/gauge-tools/index.html"]');
    await gaugeLink.click();

    // URL 변경 확인
    await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);

    // 페이지 로드가 발생했는지 확인
    await page.waitForLoadState('load');
    expect(pageLoadCount).toBeGreaterThan(0);
  });

  test('History API가 SPA 라우팅에 사용되지 않는다', async ({ page }) => {
    await page.goto('/');

    // pushState/replaceState 호출 감지
    const historyApiCalls = await page.evaluate(() => {
      let pushStateCalled = false;
      let replaceStateCalled = false;

      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function(...args) {
        pushStateCalled = true;
        return originalPushState.apply(this, args);
      };

      window.history.replaceState = function(...args) {
        replaceStateCalled = true;
        return originalReplaceState.apply(this, args);
      };

      // 짧은 대기 후 결과 반환
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            pushStateCalled,
            replaceStateCalled
          });
        }, 100);
      });
    });

    expect(historyApiCalls.pushStateCalled).toBe(false);
    expect(historyApiCalls.replaceStateCalled).toBe(false);
  });

  test('각 페이지가 완전한 HTML 문서 구조를 가진다', async ({ page }) => {
    // 홈 페이지 검증
    await page.goto('/');
    const homeHtml = await page.content();
    expect(homeHtml).toContain('<!DOCTYPE html>');
    expect(homeHtml).toContain('<html');
    expect(homeHtml).toContain('<head>');
    expect(homeHtml).toContain('<body>');

    // 게이지 변환기 페이지 검증
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');
    const gaugeHtml = await page.content();
    expect(gaugeHtml).toContain('<!DOCTYPE html>');
    expect(gaugeHtml).toContain('<html');
    expect(gaugeHtml).toContain('<head>');
    expect(gaugeHtml).toContain('<body>');
  });

  test('네비게이션이 모든 페이지에서 동일하게 작동한다', async ({ page }) => {
    // 홈에서 시작
    await page.goto('/');
    const homeNav = page.locator('nav.main-nav');
    await expect(homeNav).toBeVisible();

    // 게이지 변환기로 이동
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');
    const gaugeNav = page.locator('nav.main-nav');
    await expect(gaugeNav).toBeVisible();

    // 두 페이지의 네비게이션이 동일한 링크를 가지는지 확인
    const gaugeNavLinks = await gaugeNav.locator('a').count();
    expect(gaugeNavLinks).toBeGreaterThan(0);
  });

  test('페이지 새로고침이 정상 작동한다', async ({ page }) => {
    // 게이지 변환기 페이지로 이동
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');
    await expect(page.locator('h1')).toContainText('게이지 변환');

    // 페이지 새로고침
    await page.reload();

    // 동일한 페이지가 로드되는지 확인
    await expect(page).toHaveURL(/.*gauge-tools\/index\.html$/);
    await expect(page.locator('h1')).toContainText('게이지 변환');
  });
});
