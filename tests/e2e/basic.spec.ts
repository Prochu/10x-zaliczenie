import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load successfully and show title", async ({ page }) => {
    await expect(page).toHaveTitle(/BetBuddy/i);
  });

  test("should have main navigation", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should take a screenshot of the homepage", async ({ page }) => {
    await expect(page).toHaveScreenshot("homepage.png");
  });
});
