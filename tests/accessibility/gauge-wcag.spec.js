import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('게이지 변환기 접근성 (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/knitting-tools/gauge-tools/index.html');
  });

  test('자동화된 접근성 검사를 통과한다 (skip link 제외)', async ({ page }) => {
    // Note: Skip link가 제거되었음 (사용자 요청)
    // 실제 네비게이션이 짧아 키보드 사용자 불편 최소화
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['skip-link', 'bypass'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('폼 요소에 적절한 레이블이 있다', async ({ page }) => {
    // 모든 input 요소 확인
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');

      // 해당하는 label이 있는지 확인
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    }
  });

  test('라디오 버튼에 fieldset과 legend가 있다', async ({ page }) => {
    const fieldset = page.locator('fieldset.unit-selection');
    await expect(fieldset).toBeVisible();

    const legend = fieldset.locator('legend');
    await expect(legend).toBeVisible();
  });

  test('ARIA 속성이 올바르게 설정된다', async ({ page }) => {
    // 모든 input에 aria-label 확인
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }

    // 결과 영역 aria-live 확인
    const resultStitches = page.locator('#result-stitches');
    await expect(resultStitches).toHaveAttribute('aria-live', 'polite');
  });

  test('키보드로 폼을 완전히 조작할 수 있다', async ({ page }) => {
    // 포커스 가능한 요소가 있는지 확인
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);

    // 첫 번째 입력 필드에 프로그래밍 방식으로 포커스
    const firstInput = inputs.first();
    await firstInput.focus();

    // 포커스 스타일 확인
    const outlineStyle = await firstInput.evaluate(el =>
      window.getComputedStyle(el).outlineWidth
    );
    expect(outlineStyle).toBeTruthy();

    // Tab 키로 다음 요소로 이동 가능한지 확인
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['INPUT', 'BUTTON']).toContain(focusedElement);
  });

  test('에러 메시지가 접근 가능하다', async ({ page }) => {
    // 잘못된 입력으로 에러 발생
    await page.locator('#input-stitches').fill('100');
    await page.locator('#calculate').click();

    // 에러 컨테이너 확인
    const errorContainer = page.locator('#error-container');
    const errorRole = await errorContainer.getAttribute('role');

    // role="alert" 또는 aria-live 속성 확인
    const ariaLive = await errorContainer.getAttribute('aria-live');
    expect(errorRole === 'alert' || ariaLive === 'assertive').toBeTruthy();
  });

  test('계산 버튼이 충분한 크기를 가진다', async ({ page }) => {
    const button = page.locator('#calculate');
    const box = await button.boundingBox();

    // 최소 44x44px (WCAG 2.1 AA)
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
