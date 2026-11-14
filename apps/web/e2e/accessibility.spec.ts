import { expect, test } from "@playwright/test";

const P = "/projects/studio-landing";

const focusRing = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    return { tag: el.tagName, text: el.textContent?.trim().slice(0, 40) ?? "", outline: s.outlineStyle, width: s.outlineWidth };
  });

test.describe("AC18 · keyboard and reduced motion", () => {
  test("Tab walks the shell with a visible focus ring", async ({ page }) => {
    await page.goto(`${P}/animations`);
    await expect(page.getByRole("heading", { name: "Animations" })).toBeVisible();
    const seen: string[] = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      const f = await focusRing(page);
      expect(f, `focus after ${i + 1} tabs`).not.toBeNull();
      expect(["A", "BUTTON", "INPUT"]).toContain(f!.tag);
      expect(f!.outline).toBe("solid");
      expect(f!.width).toBe("2px");
      seen.push(f!.text);
    }
    expect(seen.join("|")).toContain("Flipbook");
    expect(seen.join("|")).toContain("Overview");
    expect(seen.join("|")).toContain("Export");

    const row = page.getByTestId("timeline-row-spring");
    await row.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/anim=spring/);
  });

  test("the lesson quiz can be completed with the keyboard alone", async ({ page }) => {
    await page.goto(`${P}/learn`);
    await page.getByRole("button", { name: "4 · Check" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Quick check" })).toBeVisible();
    await page.getByRole("button", { name: "0ms", exact: true }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("quiz-feedback")).toContainText("They all move together");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "90ms" })).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Finish lesson · +60 XP" })).toBeFocused();
    expect((await focusRing(page))!.outline).toBe("solid");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/learn\/challenge$/);
  });

  test("OS reduced motion collapses entry animations but keeps the lesson demo", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${P}/animations`);
    const duration = (testId: string) => page.getByTestId(testId).first().evaluate((el) => getComputedStyle(el).animationDuration);
    await expect.poll(() => duration("inspector-cards-card")).toBe("1e-05s");
    await page.goto(`${P}/learn`);
    await expect.poll(() => duration("lesson-cards-card")).toBe("0.48s");
  });

  test("the in-app reduce-motion setting does the same", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("switch", { name: /reduce motion/i }).click();
    await page.goto(`${P}/build`);
    await expect(page.getByTestId("build-preview")).toBeVisible();
    await expect
      .poll(() => page.getByTestId("build-preview").evaluate((el) => getComputedStyle(el).transitionDuration))
      .toBe("1e-05s");
    await page.goto(`${P}/animations`);
    await expect.poll(() => page.getByTestId("inspector-cards-card").first().evaluate((el) => getComputedStyle(el).animationDuration)).toBe("1e-05s");
  });
});
