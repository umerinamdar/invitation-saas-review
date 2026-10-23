import { test, expect } from "@playwright/test";

// baseURL comes from playwright.config.ts (a fixed port dedicated to this
// suite); every goto() below is relative to it.

test.describe("viewport sanity", () => {
  for (const { label, width, height } of [
    { label: "desktop", width: 1440, height: 900 },
    { label: "tablet", width: 768, height: 1024 },
    { label: "mobile", width: 375, height: 812 },
  ]) {
    test(`landing page renders at ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await expect(
        page.getByRole("link", { name: "Create yours" }).first(),
      ).toBeVisible();
    });
  }
});

test.describe("primary flow: browse a design, open its invitation", () => {
  test("homepage -> templates -> theme preview -> envelope opens", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/EasyInviteMaker/);

    await page.getByRole("link", { name: /Browse \d+ designs/ }).click();
    await expect(page).toHaveURL(/\/templates$/);

    await page
      .getByRole("link", { name: "Preview Dubai Silk" })
      .click();
    await expect(page).toHaveURL(/\/preview\/dubai-silk$/);

    // The reveal trigger is the mechanic's own container now (the wax-
    // seal button was removed); its aria-label is "Open the invitation
    // from {hosts}" (src/components/reveals/index.tsx).
    const openTrigger = page.getByRole("button", {
      name: /Open the invitation from/,
    });
    await expect(openTrigger).toBeVisible();
    await openTrigger.click();

    await expect(
      page.getByRole("heading", { level: 1 }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("editor loads with a selected theme and accepts input", async ({
    page,
  }) => {
    await page.goto("/create?theme=dubai-silk");
    await expect(
      page.getByText("Your names", { exact: true }),
    ).toBeVisible();

    // Placeholder names are deliberately fictional (Aarav & Diya) — an
    // earlier version used a real celebrity couple's names as filler,
    // which was removed as unacceptable sample data (src/invites/
    // demo-wedding.ts). Don't reintroduce real names here.
    const nameInput = page.getByPlaceholder("Aarav", { exact: true });
    await nameInput.fill("Test Groom");
    await expect(nameInput).toHaveValue("Test Groom");

    const partnerInput = page.getByPlaceholder("Diya", { exact: true });
    await partnerInput.fill("Test Bride");
    await expect(partnerInput).toHaveValue("Test Bride");
  });
});
