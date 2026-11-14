import { expect, test } from "@playwright/test";

test.describe("AC2 · shell and routing", () => {
  test("workspace and project sidebars, active item, and meters", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
    const workspace = page.getByRole("navigation", { name: "Workspace" });
    await expect(workspace.getByRole("link")).toHaveText(["Dashboard", "Templates6", "Your skills", "Settings"]);
    await expect(workspace.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("learned-meter")).toHaveText("2 of 5 animations learned");

    await page.goto("/projects/studio-landing/learn/challenge");
    const project = page.getByRole("navigation", { name: "Project" });
    await expect(project.getByRole("link")).toHaveText([
      "← All projects",
      "Overview94%",
      "Build",
      "Animations5",
      "Learn2/5",
      "Assets9",
      "Historyv7",
      "Export",
    ]);
    await expect(project.getByRole("link", { name: /^Learn/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("breadcrumb")).toHaveText("studio-landing / Challenge");

    await page.goto("/projects/pricing-page/review");
    await expect(page.getByRole("navigation", { name: "Project" })).toHaveCount(0);
  });

  test("top bar links and XP chip", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("xp-chips")).toContainText("7-day streak");
    await page.getByRole("link", { name: /Level 4, 1,240 XP/ }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await page.getByRole("link", { name: "New project" }).first().click();
    await expect(page).toHaveURL(/\/new$/);
    await page.getByRole("link", { name: "Flipbook, go to dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("deep links survive refresh and back/forward", async ({ page }) => {
    await page.goto("/templates");
    await page.getByRole("link", { name: /Your skills/ }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.getByRole("heading", { name: "Start from a sample" })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole("heading", { name: "Your motion skills" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Your motion skills" })).toBeVisible();
  });

  test("unknown projects and routes show not-found with a way back", async ({ page }) => {
    await page.goto("/projects/does-not-exist/overview");
    await expect(page.getByRole("heading", { name: "We can't find that project" })).toBeVisible();
    await page.getByRole("link", { name: "← Back to dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    const res = await page.goto("/nope");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page doesn't exist" })).toBeVisible();
  });

  test("mobile drawer replaces the sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await expect(page.getByRole("navigation", { name: "Workspace" })).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("dialog", { name: "Navigation" }).getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
