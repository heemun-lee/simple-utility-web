import { test, expect } from '@playwright/test';

test.describe('홈 페이지 콘텐츠', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('메인 제목이 존재한다', async ({ page }) => {
    // h1 태그 확인
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();

    // 제목 텍스트 확인
    await expect(mainHeading).toContainText('Simple Utility Web');
  });

  test('main 요소가 올바른 구조를 가진다', async ({ page }) => {
    // main 요소 존재 확인
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();

    // role="main" 속성 확인
    await expect(main).toHaveAttribute('role', 'main');
  });

  test('Hero 섹션이 표시된다', async ({ page }) => {
    // Hero 섹션 확인
    const hero = page.locator('.hero, header.hero, section.hero').first();
    await expect(hero).toBeVisible();

    // 제목 확인
    const heroTitle = hero.locator('h1');
    await expect(heroTitle).toBeVisible();

    // 설명 텍스트 확인
    const heroDescription = hero.locator('p');
    await expect(heroDescription).toBeVisible();
  });

  test('유틸리티 카드 그리드가 표시된다', async ({ page }) => {
    // 유틸리티 섹션 확인
    const utilitiesSection = page.locator('.utilities-grid, .utilities, section').filter({
      has: page.locator('.utility-card, .card, article')
    }).first();

    await expect(utilitiesSection).toBeVisible();

    // 최소 1개 이상의 카드 존재
    const cards = page.locator('.utility-card, .card, article').filter({
      hasText: /게이지|변환|계산/
    });

    await expect(cards.first()).toBeVisible();
  });

  test('각 유틸리티 카드에 링크가 포함된다', async ({ page }) => {
    // 카드 내 링크 확인
    const cardLinks = page.locator('.utility-card a, .card a, article a').filter({
      hasText: /사용하기|바로가기|시작/
    });

    const count = await cardLinks.count();

    if (count > 0) {
      // 첫 번째 링크 확인
      const firstLink = cardLinks.first();
      await expect(firstLink).toBeVisible();

      // 상대 경로 확인
      const href = await firstLink.getAttribute('href');
      expect(href).toMatch(/^\.\/.*\.html$/);
    }
  });

  test('페이지 타이틀이 올바르게 설정된다', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Simple Utility Web/);
  });

  test('메타 설명이 존재한다', async ({ page }) => {
    // 메타 description 태그 확인
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);

    const content = await metaDescription.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(10);
  });

  test('뷰포트 메타 태그가 올바르게 설정된다', async ({ page }) => {
    // 뷰포트 메타 태그 확인
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1.0');
  });
});
