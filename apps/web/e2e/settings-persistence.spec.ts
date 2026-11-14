import { expect, test } from "@playwright/test";

test.describe("V7 · settings, persistence and reset", () => {
  test("settings and progress survive reload; XP off hides the chip and its toasts", async ({ page }) => {
    await page.goto("/settings");
    const review = page.getByRole("switch", { name: "Review analysis before generating" });
    await expect(review).toHaveAttribute("aria-checked", "true");
    await review.click();
    await expect(review).toHaveAttribute("aria-checked", "false");

    await page.getByRole("button", { name: /Default lesson level: Intermediate/ }).click();
    await expect(page.getByRole("button", { name: /Default lesson level: Advanced/ })).toBeVisible();
    await page.getByRole("button", { name: /Delete recordings after generation: After 30 days/ }).click();
    await expect(page.getByRole("button", { name: /Delete recordings after generation: After 7 days/ })).toBeVisible();

    await page.getByRole("switch", { name: "Show XP, levels and streaks" }).press("Space");
    await expect(page.getByTestId("xp-chips")).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("switch", { name: "Review analysis before generating" })).toHaveAttribute("aria-checked", "false");
    await expect(page.getByRole("button", { name: /Default lesson level: Advanced/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /After 7 days/ })).toBeVisible();
    await expect(page.getByTestId("xp-chips")).toHaveCount(0);

    await page.goto("/projects/studio-landing/overview");
    await page.getByRole("button", { name: "Fix it · +30 XP" }).click();
    await expect(page.getByTestId("match-pct")).toHaveText("99%");
    await expect(page.getByTestId("toast")).toHaveCount(0);

    await page.goto("/skills");
    await expect(page.getByTestId("level-xp")).toHaveText("1,270 / 1,600 XP");

    await page.goto("/new");
    await page.getByRole("button", { name: "Record a tab" }).click();
    await expect(page.getByRole("button", { name: "Generate site →" })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Generate site →" }).click();
    await expect(page).toHaveURL(/\/tab-recording\/overview$/);

    await page.reload();
    await expect(page.getByTestId("match-pct")).toHaveText("94%");
    await page.goto("/dashboard");
    await expect(page.getByTestId("project-tab-recording")).toContainText("READY");
  });

  test("reset demo data restores the sample workspace", async ({ page }) => {
    await page.goto("/projects/studio-landing/overview");
    await page.getByRole("button", { name: "Fix it · +30 XP" }).click();
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,270 XP");
    await page.goto("/settings");
    await page.getByRole("switch", { name: "Reduce motion in Flipbook" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");

    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(page.getByTestId("toast").filter({ hasText: "Demo data reset" })).toBeVisible();
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,240 XP");
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "false");
    await page.reload();
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,240 XP");
    await page.goto("/projects/studio-landing/overview");
    await expect(page.getByTestId("match-pct")).toHaveText("94%");
  });

  test("corrupt or old stored data falls back to the sample workspace", async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("flipbook:v1", "{not json");
        sessionStorage.setItem("seeded", "1");
      }
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/dashboard");
    await expect(page.getByTestId("project-studio-landing")).toBeVisible();
    expect(errors).toEqual([]);

    await page.evaluate(() => localStorage.setItem("flipbook:v1", JSON.stringify({ schema: 0, projects: [] })));
    await page.reload();
    await expect(page.getByTestId("project-studio-landing")).toBeVisible();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("flipbook:v1") ?? "{}").schema);
    expect(stored).toBe(1);
  });

  test("settings rows are keyboard operable", async ({ page }) => {
    await page.goto("/settings");
    const row = page.getByRole("switch", { name: "Allow my recordings to improve models" });
    await row.focus();
    await page.keyboard.press("Enter");
    await expect(row).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /Delete recordings after generation: After 7 days/ })).toBeFocused();
  });
});

test.describe("AC14 · reduced motion", () => {
  const pulseDuration = (page: import("@playwright/test").Page) =>
    page.locator(".animate-fb-pulse").first().evaluate((el) => getComputedStyle(el).animationDuration);

  test("the in-app setting disables non-essential animation", async ({ page }) => {
    await page.goto("/new");
    await page.getByRole("button", { name: "Record a tab" }).click();
    await expect(page.locator(".animate-fb-pulse")).toHaveCount(1);
    expect(await pulseDuration(page)).toBe("1.2s");

    await page.goto("/settings");
    await page.getByRole("switch", { name: "Reduce motion in Flipbook" }).click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");
    await page.goto("/new");
    await page.getByRole("button", { name: "Record a tab" }).click();
    await expect(page.locator(".animate-fb-pulse")).toHaveCount(1);
    expect(await pulseDuration(page)).toBe("1e-05s");
  });

  test("the OS preference disables non-essential animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/new");
    await page.getByRole("button", { name: "Record a tab" }).click();
    await expect(page.locator(".animate-fb-pulse")).toHaveCount(1);
    expect(await pulseDuration(page)).toBe("1e-05s");
  });
});
