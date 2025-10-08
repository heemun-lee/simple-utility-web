import { test, expect } from '@playwright/test';

test.describe('게이지 변환 계산기 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('메뉴를 통해 게이지 변환 계산기 페이지로 이동', async ({ page }) => {
    // 1depth 메뉴 클릭
    await page.click('text=편물 도구');

    // 2depth 메뉴 클릭
    await page.click('text=게이지 관련');

    // 3depth 메뉴 클릭 - 페이지 이동
    await page.click('text=게이지 변환 계산기');

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('게이지 변환 계산기');
  });

  test('기준 게이지 25코x30단 → 실제 게이지 20코x25단 → 100단 입력 시 83.33단 변환', async ({ page }) => {
    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 기준 게이지 입력
    await page.fill('#base-stitches', '25');
    await page.fill('#base-rows', '30');

    // 실제 게이지 입력
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');

    // 변환할 단수 입력
    await page.fill('#input-rows', '100');

    // 계산 버튼 클릭
    await page.click('#calculate');

    // 결과 검증
    await expect(page.locator('#result-rows')).toHaveText('83.33');
  });

  test('기준 게이지 25코x30단 → 실제 게이지 20코x25단 → 50코 입력 시 40코 변환', async ({ page }) => {
    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 기준 게이지 입력
    await page.fill('#base-stitches', '25');
    await page.fill('#base-rows', '30');

    // 실제 게이지 입력
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');

    // 변환할 코수 입력
    await page.fill('#input-stitches', '50');

    // 계산 버튼 클릭
    await page.click('#calculate');

    // 결과 검증
    await expect(page.locator('#result-stitches')).toHaveText('40');
  });

  test('코수와 단수를 동시에 변환', async ({ page }) => {
    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 기준 게이지 입력
    await page.fill('#base-stitches', '25');
    await page.fill('#base-rows', '30');

    // 실제 게이지 입력
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');

    // 변환할 코수와 단수 입력
    await page.fill('#input-stitches', '100');
    await page.fill('#input-rows', '120');

    // 계산 버튼 클릭
    await page.click('#calculate');

    // 결과 검증
    await expect(page.locator('#result-stitches')).toHaveText('80');
    await expect(page.locator('#result-rows')).toHaveText('100');
  });

  test('0으로 나누기 오류 처리', async ({ page }) => {
    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 기준 게이지에 0 입력
    await page.fill('#base-stitches', '0');
    await page.fill('#base-rows', '30');

    // 실제 게이지 입력
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');

    // 변환할 코수 입력
    await page.fill('#input-stitches', '50');

    // 계산 버튼 클릭
    await page.click('#calculate');

    // 에러 메시지 확인
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('입력 필드 검증 - 빈 값', async ({ page }) => {
    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 계산 버튼 클릭 (입력 없이)
    await page.click('#calculate');

    // 에러 메시지 확인
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('소수점 결과 처리', async ({ page }) => {
    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 기준 게이지 입력
    await page.fill('#base-stitches', '22');
    await page.fill('#base-rows', '28');

    // 실제 게이지 입력
    await page.fill('#actual-stitches', '20');
    await page.fill('#actual-rows', '25');

    // 변환할 단수 입력
    await page.fill('#input-rows', '100');

    // 계산 버튼 클릭
    await page.click('#calculate');

    // 결과가 소수점 2자리까지 표시되는지 확인
    const resultText = await page.locator('#result-rows').textContent();
    expect(resultText).toMatch(/^\d+\.\d{1,2}$/);
  });
});
