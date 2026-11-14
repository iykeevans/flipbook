import { expect, test } from "@playwright/test";

test.describe("AC13 · templates", () => {
  test("level and tag filters, empty state, and opening a sample", async ({ page }) => {
    await page.goto("/templates");
    const cards = page.locator("[data-testid^='template-']");
    await expect(cards).toHaveCount(6);

    await page.getByRole("button", { name: "Advanced", exact: true }).click();
    await expect(cards).toHaveCount(2);
    await page.getByRole("button", { name: "fade", exact: true }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.getByTestId("templates-empty")).toHaveText("No samples match that combination.");

    await page.getByRole("button", { name: "fade", exact: true }).click();
    await expect(page.getByRole("button", { name: "fade", exact: true })).toHaveAttribute("aria-pressed", "false");
    await expect(cards).toHaveCount(2);

    await page.getByRole("button", { name: "All", exact: true }).click();
    await page.getByRole("button", { name: "fade", exact: true }).click();
    await expect(cards).toHaveCount(2);

    await page.getByTestId("template-agency-hero").click();
    await expect(page).toHaveURL(/\/projects\/agency-hero\/overview\?t=12$/);
    await expect(page.getByTestId("toast").filter({ hasText: "Sample opened" })).toBeVisible();
    await expect(page.getByTestId("toast").filter({ hasText: "Agency hero · 2 lessons ready" })).toBeVisible();
    await expect(page.getByTestId("match-pct")).toHaveText("99%");

    await page.goto("/dashboard");
    await expect(page.getByTestId("project-agency-hero")).toContainText("from sample · 0/2 learned");
  });
});

test.describe("AC16 · skills", () => {
  test("level card, skill tiles and projects strip react to state", async ({ page }) => {
    await page.goto("/skills");
    await expect(page.getByTestId("level-number")).toHaveText("4");
    await expect(page.getByText("Level 4 · Tweener")).toBeVisible();
    await expect(page.getByTestId("level-xp")).toHaveText("1,240 / 1,600 XP");
    await expect(page.getByText("Next: Level 5 · Choreographer unlocks scroll-linked lessons")).toBeVisible();

    const kinds = await page.locator("[data-testid^='skill-']").evaluateAll((els) => els.map((e) => e.getAttribute("data-kind")));
    expect(kinds).toEqual(["done", "done", "prog", "prog", "seen", "seen", "lock", "lock"]);
    await expect(page.getByTestId("skill-Stagger")).toContainText("2 / 4 lessons");

    await expect(page.getByRole("region", { name: "Projects" })).toContainText("studio-landing · 2/5 learned");
    await page.getByRole("link", { name: /studio-landing · 2\/5 learned/ }).click();
    await expect(page).toHaveURL(/\/projects\/studio-landing\/animations$/);
  });
});
