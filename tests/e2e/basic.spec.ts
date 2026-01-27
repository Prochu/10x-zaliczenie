import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    // Basic check to see if the page loads - adjust based on actual content
    await expect(page).toHaveTitle(/BetBuddy/i);
  });
});
