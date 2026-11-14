import { expect, test, type Page } from "@playwright/test";

const P = "/projects/studio-landing";
const toast = (page: Page, text: string) => page.getByTestId("toast").filter({ hasText: text });

test.describe("V6 · build, history, assets, export", () => {
  test("build: stack and viewport switch, assistant reject/accept, type-error fix, regenerate", async ({ page }) => {
    await page.goto(`${P}/build`);
    await expect(page.getByTestId("code-file")).toHaveText("Cards.tsx");
    await page.getByRole("group", { name: "Motion stack" }).getByRole("button", { name: "GSAP" }).click();
    await expect(page.getByTestId("code-file")).toHaveText("cards.js");
    await expect(page.getByTestId("code-text")).toContainText('ease: "power2.out"');
    await page.getByRole("group", { name: "Motion stack" }).getByRole("button", { name: "HTML/CSS" }).click();
    await expect(page.getByTestId("code-file")).toHaveText("cards.css");

    await page.getByRole("group", { name: "Preview viewport" }).getByRole("button", { name: "Mobile" }).click();
    await expect(page.getByTestId("viewport-label")).toHaveText("PREVIEW · 390 × 844");
    const previewWidth = async () => (await page.getByTestId("build-preview").boundingBox())!.width;
    await expect.poll(previewWidth).toBeLessThan(200);
    await page.getByRole("group", { name: "Preview viewport" }).getByRole("button", { name: "Desktop" }).click();
    await expect.poll(previewWidth).toBeGreaterThan(250);

    const draft = page.getByLabel("Ask for a change");
    await draft.fill("Make the footer darker");
    await draft.press("Enter");
    await expect(page.getByTestId("chat")).toContainText("Make the footer darker");
    await expect(page.getByTestId("proposed-diff")).toContainText("proposed · Hero.tsx");
    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByTestId("chat")).toContainText("Rejected. Nothing changed.");
    await expect(page.getByTestId("proposed-diff")).toHaveCount(0);

    await page.getByRole("button", { name: "Give the hero more breathing room on desktop" }).click();
    await expect(page.getByTestId("proposed-diff")).toContainText('className="py-32 md:py-40"');
    await page.getByRole("button", { name: "Accept" }).click();
    await expect(toast(page, "Saved v8")).toBeVisible();
    await expect(page.getByTestId("chat")).toContainText("Accepted. Saved as v8.");
    await expect(page.getByTestId("preview-hero")).toHaveCSS("margin-top", "30px");
    await expect(page.getByRole("button", { name: "Give the hero more breathing room on desktop" })).toHaveCount(0);

    await expect(page.getByTestId("type-error")).toBeVisible();
    await page.getByTestId("type-error").getByRole("button", { name: "Ask assistant" }).click();
    await expect(page.getByTestId("proposed-diff")).toContainText("{items?.map(i => (");
    await page.getByRole("button", { name: "Accept" }).click();
    await expect(page.getByTestId("type-error")).toHaveCount(0);
    await expect(toast(page, "Saved v9")).toBeVisible();

    await draft.fill("Tighter cards");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByTestId("proposed-diff")).toBeVisible();
    await page.getByRole("button", { name: "Reject" }).click();

    await page.getByRole("button", { name: "whole site" }).click();
    await expect(toast(page, "Regenerated · v10")).toBeVisible();
    await page.getByRole("button", { name: "this section" }).click();
    await expect(toast(page, "Regenerated · v11")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("code-file")).toHaveText("cards.css");
    await expect(page.getByTestId("chat")).toContainText("Accepted. Saved as v8.");
    await expect(page.getByTestId("type-error")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /History\s*v11/ })).toBeVisible();
  });

  test("history: compare versions, colour the diff, restore appends a version", async ({ page }) => {
    await page.goto(`${P}/history`);
    const items = page.getByRole("list", { name: "Versions, newest first" }).getByRole("button");
    await expect(items.first()).toContainText("v7 · Inspector edit");
    await expect(page.getByTestId("compare-label")).toHaveText("COMPARE v6 ↔ v7");
    const color = (tone: string) => page.getByTestId("diff").locator(`[data-tone="${tone}"]`).evaluate((el) => getComputedStyle(el).color);
    expect(await color("removed")).not.toBe(await color("added"));
    await expect(page.getByTestId("diff").locator('[data-tone="added"]')).toHaveText("+ transition: { duration: 0.48 }");
    await expect(page.getByRole("button", { name: "Restore v6" })).toBeVisible();

    await page.getByTestId("version-v4").click();
    await expect(page.getByTestId("compare-label")).toHaveText("COMPARE v1 ↔ v4");
    await page.getByRole("button", { name: "Restore v4" }).click();
    await expect(toast(page, "Restored v4")).toBeVisible();
    await expect(toast(page, "Saved as v8")).toBeVisible();
    await expect(items.first()).toContainText("v8 · Restored");
    await expect(items.first()).toContainText("Back to v4");
    await expect(items).toHaveCount(6);
    await expect(page.getByText("Restoring creates v9; nothing is overwritten.")).toBeVisible();

    await page.getByTestId("version-v1").click();
    await expect(page.getByTestId("compare-label")).toHaveText("COMPARE v1");
    await page.reload();
    await expect(items).toHaveCount(6);
  });

  test("assets: tabs, card-2 placeholder, replace once", async ({ page }) => {
    await page.goto(`${P}/assets`);
    const tabs = page.getByRole("group", { name: "Asset type" });
    await expect(tabs.getByRole("button")).toHaveText(["Images · 5", "Frames · 42", "Fonts · 2", "Recording"]);
    await expect(page.getByTestId("asset-card-2")).toContainText("blurred in recording · replace");
    await expect(page.getByTestId("placeholder-thumb")).toBeVisible();

    await tabs.getByRole("button", { name: "Frames · 42" }).click();
    await expect(page.getByTestId("asset-grid").getByRole("listitem")).toHaveCount(8);
    await tabs.getByRole("button", { name: "Fonts · 2" }).click();
    await expect(page.getByTestId("asset-grid")).toContainText("Display font");
    await tabs.getByRole("button", { name: "Recording" }).click();
    await expect(page.getByTestId("asset-grid")).toContainText("studio-landing.mp4");

    await page.getByRole("button", { name: "Replace card-2" }).click();
    await expect(toast(page, "Saved v8")).toBeVisible();
    await expect(tabs.getByRole("button", { name: "Images · 5" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("asset-card-2")).toContainText("card-2-upload.webp");
    await expect(page.getByTestId("placeholder-thumb")).toHaveCount(0);
    await page.getByRole("button", { name: "Upload replacement" }).click();
    await expect(toast(page, "Pick an asset first")).toBeVisible();
    await expect(page.getByRole("link", { name: /History\s*v8/ })).toBeVisible();
  });

  test("export: targets, toggles, simulated deploy, done card and +80 XP once", async ({ page }) => {
    await page.goto(`${P}/export`);
    await expect(page.getByRole("heading", { name: "Ship it" })).toBeVisible();
    await expect(page.getByTestId("stack-summary")).toHaveText("React · Tailwind · Framer Motion");
    const placeholders = page.getByRole("switch", { name: "Replace recorded images with placeholders" });
    await expect(placeholders).toHaveAttribute("aria-checked", "false");
    await placeholders.click();
    await expect(placeholders).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("2 of 5 animations learned in this project")).toBeVisible();

    await page.getByRole("button", { name: "Deploy studio-landing" }).click();
    await expect(page.getByTestId("deploy-log")).toContainText("› building with vite");
    await expect(page.getByTestId("deploy-done")).toContainText("Live", { timeout: 10_000 });
    await expect(page.getByTestId("deploy-done")).toContainText("studio-landing.flipbook.app");
    await expect(toast(page, "+80 XP")).toBeVisible();
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,320 XP");

    await page.getByRole("button", { name: /Push to GitHub/ }).first().click();
    await expect(page.getByTestId("deploy-done")).toHaveCount(0);
    await page.getByRole("button", { name: "Push to GitHub" }).last().click();
    await expect(page.getByTestId("deploy-done")).toContainText("github.com/you/studio-landing · main", { timeout: 10_000 });
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,320 XP");

    await page.getByRole("link", { name: "See your skills →" }).click();
    await expect(page).toHaveURL(/\/skills$/);
  });
});
