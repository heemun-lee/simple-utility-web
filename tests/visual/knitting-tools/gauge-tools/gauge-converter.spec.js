import { test, expect } from '@playwright/test';

test.describe('게이지 변환 계산기 Visual 테스트', () => {
  test('게이지 변환 계산기 페이지 스냅샷', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('h1');

    // 스냅샷 비교
    await expect(page).toHaveScreenshot('gauge-converter-initial.png');
  });

  test('계산 결과 표시 스냅샷', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 입력
    await page.fill('#base-stitches', '25');
    await page.fill('#base-rows', '30');
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');
    await page.fill('#input-rows', '100');

    // 계산
    await page.click('#calculate');

    // 결과 대기
    await page.waitForSelector('#result-rows:not(:empty)');

    // 결과 영역 스냅샷
    await expect(page.locator('#result')).toHaveScreenshot('gauge-result-displayed.png');
  });

  test('모바일 뷰포트 스냅샷', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // 페이지 이동
    await page.click('.menu-toggle');
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('h1');

    // 모바일 스냅샷
    await expect(page).toHaveScreenshot('gauge-converter-mobile.png');
  });

  test('에러 상태 스냅샷', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 잘못된 입력 (0으로 나누기)
    await page.fill('#base-stitches', '0');
    await page.fill('#base-rows', '30');
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');
    await page.fill('#input-stitches', '50');

    // 계산
    await page.click('#calculate');

    // 에러 메시지 대기
    await page.waitForSelector('.error-message');

    // 에러 스냅샷
    await expect(page.locator('.error-message')).toHaveScreenshot('gauge-error-state.png');
  });

  test('다크 모드 스냅샷', async ({ page }) => {
    // 다크 모드 시스템 설정 에뮬레이션
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('h1');

    // 다크 모드 스냅샷
    await expect(page).toHaveScreenshot('gauge-converter-dark-mode.png');
  });
});
