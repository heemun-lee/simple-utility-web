import { test, expect } from '@playwright/test';

test.describe('게이지 변환기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');
  });

  test.describe('페이지 구조', () => {
    test('페이지 제목이 올바르게 표시된다', async ({ page }) => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('게이지 변환');
    });

    test('네비게이션에서 게이지 변환기가 활성 상태로 표시된다', async ({ page }) => {
      const activeLink = page.locator('a[aria-current="page"]');
      await expect(activeLink).toBeVisible();
      await expect(activeLink).toContainText('게이지 변환');
    });
  });

  test.describe('폼 렌더링', () => {
    test('측정 기준 선택 폼이 렌더링된다', async ({ page }) => {
      const unit10cm = page.locator('#unit-10cm');
      const unit4inch = page.locator('#unit-4inch');
      await expect(unit10cm).toBeVisible();
      await expect(unit4inch).toBeVisible();
      await expect(unit10cm).toBeChecked();
    });

    test('모든 입력 필드가 렌더링된다', async ({ page }) => {
      // 기준 게이지
      await expect(page.locator('#base-stitches')).toBeVisible();
      await expect(page.locator('#base-rows')).toBeVisible();

      // 실제 게이지
      await expect(page.locator('#actual-stitches')).toBeVisible();
      await expect(page.locator('#actual-rows')).toBeVisible();

      // 변환할 값
      await expect(page.locator('#input-stitches')).toBeVisible();
      await expect(page.locator('#input-rows')).toBeVisible();

      // 계산 버튼
      await expect(page.locator('#calculate')).toBeVisible();
    });
  });

  test.describe('게이지 변환 기능', () => {
    test('10cm 기준 게이지 변환이 정확하다', async ({ page }) => {
      // 기준 게이지: 25코 x 30단
      await page.locator('#base-stitches').fill('25');
      await page.locator('#base-rows').fill('30');

      // 실제 게이지: 20코 x 25단
      await page.locator('#actual-stitches').fill('20');
      await page.locator('#actual-rows').fill('25');

      // 변환할 값: 100코 x 120단
      await page.locator('#input-stitches').fill('100');
      await page.locator('#input-rows').fill('120');

      // 계산 실행
      await page.locator('#calculate').click();

      // 결과 확인 (100 * 20/25 = 80코, 120 * 25/30 = 100단)
      const resultStitches = page.locator('#result-stitches');
      const resultRows = page.locator('#result-rows');

      await expect(resultStitches).toContainText('80');
      await expect(resultRows).toContainText('100');
    });

    test('4 inch 기준으로 라벨이 변경된다', async ({ page }) => {
      await page.locator('#unit-4inch').click();

      const baseStitchesLabel = page.locator('label[for="base-stitches"]');
      await expect(baseStitchesLabel).toContainText('4 inch 기준');
    });

    test('Enter 키로 계산이 실행된다', async ({ page }) => {
      await page.locator('#base-stitches').fill('25');
      await page.locator('#base-rows').fill('30');
      await page.locator('#actual-stitches').fill('20');
      await page.locator('#actual-rows').fill('25');
      await page.locator('#input-stitches').fill('50');

      await page.locator('#input-stitches').press('Enter');

      const resultStitches = page.locator('#result-stitches');
      await expect(resultStitches).toContainText('40');
    });

    test('단수만 입력해도 계산된다', async ({ page }) => {
      await page.locator('#base-stitches').fill('25');
      await page.locator('#base-rows').fill('30');
      await page.locator('#actual-stitches').fill('20');
      await page.locator('#actual-rows').fill('25');
      await page.locator('#input-rows').fill('60');

      await page.locator('#calculate').click();

      const resultRows = page.locator('#result-rows');
      await expect(resultRows).toContainText('50');
    });

    test('결과가 정수로 반올림된다', async ({ page }) => {
      await page.locator('#base-stitches').fill('10');
      await page.locator('#base-rows').fill('10');
      await page.locator('#actual-stitches').fill('12.7');
      await page.locator('#actual-rows').fill('12.7');
      await page.locator('#input-stitches').fill('20');
      await page.locator('#calculate').click();

      const resultStitches = page.locator('#result-stitches');
      await expect(resultStitches).toContainText('25'); // 20 * 12.7/10 = 25.4 → 25

      await page.locator('#actual-stitches').fill('12.75');
      await page.locator('#calculate').click();
      await expect(resultStitches).toContainText('26'); // 20 * 12.75/10 = 25.5 → 26

      await page.locator('#actual-stitches').fill('12.8');
      await page.locator('#calculate').click();
      await expect(resultStitches).toContainText('26'); // 20 * 12.8/10 = 25.6 → 26
    });
  });

  test.describe('유효성 검증', () => {
    test('유효하지 않은 입력에 대해 에러를 표시한다', async ({ page }) => {
      await page.locator('#input-stitches').fill('100');
      await page.locator('#calculate').click();

      const errorContainer = page.locator('#error-container');
      await expect(errorContainer).toBeVisible();
    });
  });
});
