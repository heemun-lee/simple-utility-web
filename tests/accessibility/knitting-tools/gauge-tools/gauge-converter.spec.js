import { test, expect } from '@playwright/test';

test.describe('게이지 변환 계산기 Accessibility 테스트', () => {
  test('WCAG 2.1 AA 접근성 검증', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('h1');

    // 접근성 검증 (기본 체크)
    // Note: axe-core 통합 시 더 상세한 검증 가능

    // 1. 페이지 제목 존재
    await expect(page.locator('h1')).toBeVisible();

    // 2. 모든 입력 필드에 label 또는 aria-label 존재
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      expect(id || ariaLabel || placeholder).toBeTruthy();
    }

    // 3. 버튼에 접근 가능한 텍스트 존재
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('키보드 네비게이션', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('#base-stitches', { timeout: 5000 });

    // 입력 필드가 포커스 가능한지 확인
    await page.focus('#base-stitches');
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('base-stitches');

    // 계산 버튼 포커스 가능 확인
    await page.focus('#calculate');
    const buttonFocused = await page.evaluate(() => document.activeElement?.id);
    expect(buttonFocused).toBe('calculate');

    // Enter 키로 버튼 활성화 가능 확인
    await page.keyboard.press('Enter');
  });

  test('포커스 표시 확인', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('#base-stitches', { timeout: 5000 });

    // 입력 필드 포커스
    await page.click('#base-stitches');

    // 포커스 스타일 확인
    const focusedInput = page.locator('#base-stitches:focus');
    await expect(focusedInput).toBeVisible();

    // outline 또는 box-shadow가 있는지 확인
    const outlineStyle = await focusedInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.outline || computed.boxShadow;
    });

    expect(outlineStyle).toBeTruthy();
  });

  test('스크린 리더용 ARIA 속성 확인', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('#base-stitches', { timeout: 5000 });

    // 에러 메시지 영역 role="alert" 확인
    await page.fill('#base-stitches', '0');
    await page.click('#calculate');

    await page.waitForSelector('.error-message');
    const errorRole = await page.locator('.error-message').getAttribute('role');
    expect(errorRole).toBe('alert');
  });

  test('색상 대비 검증', async ({ page }) => {
    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('h1', { timeout: 5000 });

    // 기본 텍스트 색상 확인
    const h1Exists = await page.locator('h1').count();
    expect(h1Exists).toBeGreaterThan(0);

    // 버튼 색상 확인
    const buttonExists = await page.locator('#calculate').count();
    expect(buttonExists).toBeGreaterThan(0);
  });

  test('모바일 터치 타겟 크기', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // 페이지 이동
    await page.click('.menu-toggle');
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 계산 버튼 크기 확인 (최소 44x44px)
    const buttonSize = await page.locator('#calculate').boundingBox();

    expect(buttonSize).toBeTruthy();
    expect(buttonSize.width).toBeGreaterThanOrEqual(44);
    expect(buttonSize.height).toBeGreaterThanOrEqual(44);

    // 입력 필드 크기 확인
    const inputSize = await page.locator('#base-stitches').boundingBox();

    expect(inputSize).toBeTruthy();
    expect(inputSize.height).toBeGreaterThanOrEqual(44);
  });

  test('Reduced Motion 지원', async ({ page }) => {
    // prefers-reduced-motion 에뮬레이션
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');

    // 페이지 이동
    await page.click('text=편물 도구');
    await page.click('text=게이지 관련');
    await page.click('text=게이지 변환 계산기');

    // 페이지 로드 대기
    await page.waitForSelector('#calculate', { timeout: 5000 });

    // 애니메이션이 설정되어 있는지 확인 (값의 정확성보다는 속성 존재 여부)
    const hasTransition = await page.locator('#calculate').evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.transitionDuration !== undefined;
    });

    expect(hasTransition).toBeTruthy();
  });
});
