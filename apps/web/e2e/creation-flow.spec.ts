import { expect, test } from "@playwright/test";

test.describe("V4 · create → process → review → generate → overview", () => {
  test("rejects an invalid upload, then records, reviews, generates and fixes the match", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "+ New project" }).click();
    await expect(page).toHaveURL(/\/new$/);
    await expect(page.getByTestId("breadcrumb")).toHaveText("New project");
    await expect(page.getByRole("navigation", { name: "Workspace" })).toHaveCount(0);

    await page.getByTestId("file-input").setInputFiles({ name: "notes.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
    await expect(page.getByTestId("upload-error")).toContainText("isn't a supported video");
    await expect(page).toHaveURL(/\/new$/);

    await page.getByRole("button", { name: "React" }).click();
    await expect(page.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "false");

    await page.getByRole("button", { name: "Record a tab" }).click();
    await expect(page).toHaveURL(/\/projects\/tab-recording\/processing$/);
    await expect(page.getByRole("heading", { name: "Reading your recording…" })).toBeVisible();
    await expect(page.getByText("queued").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your site is ready" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("processing-pct")).toHaveText("100%");

    await page.getByRole("button", { name: "Review analysis →" }).click();
    await expect(page).toHaveURL(/\/tab-recording\/review$/);
    await expect(page.getByRole("heading", { name: "Check what we found" })).toBeVisible();

    await page.getByRole("button", { name: "Hero" }).click();
    await expect(page.getByTestId("overlay-Hero")).toHaveCSS("opacity", "1");
    await expect(page.getByTestId("overlay-Nav")).toHaveCSS("opacity", "0.2");
    await expect(page.getByTestId("overlay-Testimonials")).toHaveCSS("border-top-style", "dashed");

    await page.getByRole("button", { name: "Frame at 00:18" }).click();
    await expect(page.getByTestId("frame-caption")).toContainText("showing 00:18");

    await expect(page.getByText("ANIMATIONS · 4 OF 5")).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /Button spring/ })).toContainText("0.64 · low");
    await page.getByRole("checkbox", { name: /Scroll parallax/ }).click();
    await expect(page.getByText("ANIMATIONS · 3 OF 5")).toBeVisible();

    await page.getByRole("button", { name: "Generate site" }).click();
    await expect(page).toHaveURL(/\/tab-recording\/overview$/);
    await expect(page.getByTestId("toast").filter({ hasText: "Site generated" })).toBeVisible();
    await expect(page.getByTestId("toast").filter({ hasText: "tab-recording · 3 animations · 94% match" })).toBeVisible();
    await expect(page.getByRole("link", { name: /History\s*v1/ })).toBeVisible();

    await expect(page.getByTestId("time-label")).toHaveText("00:12 / 00:48");
    await expect(page.getByTestId("flagged-card")).toBeVisible();
    const box = (await page.getByTestId("scrubber").boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
    await expect(page.getByTestId("time-label")).toHaveText("00:36 / 00:48");
    await expect(page.getByTestId("recording-frame")).toHaveText("video frame @ 00:36");

    await page.getByTestId("scrubber").focus();
    await page.keyboard.press("Home");
    await expect(page.getByTestId("time-label")).toHaveText("00:00 / 00:48");
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByTestId("time-label")).not.toHaveText("00:00 / 00:48");
    await page.getByRole("button", { name: "Pause" }).click();

    await expect(page.getByTestId("match-pct")).toHaveText("94%");
    await page.getByRole("button", { name: "Fix it · +30 XP" }).click();
    await expect(page.getByTestId("match-pct")).toHaveText("99%");
    await expect(page.getByTestId("toast").filter({ hasText: "+30 XP" })).toBeVisible();
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,270 XP");
    await expect(page.getByTestId("flagged-card")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See the 5 animations →" })).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("match-pct")).toHaveText("99%");
    await expect(page.getByRole("button", { name: "Fix it · +30 XP" })).toHaveCount(0);
    await expect(page.getByTestId("xp-chip-text")).toContainText("1,270 XP");
  });

  test("honours ?t= on the overview", async ({ page }) => {
    await page.goto("/projects/studio-landing/overview?t=20");
    await expect(page.getByTestId("time-label")).toHaveText("00:20 / 00:48");
  });

  test("URL auto-record needs a URL, then starts the pipeline", async ({ page }) => {
    await page.goto("/new");
    await page.getByRole("button", { name: "Auto-record" }).click();
    await expect(page.getByTestId("upload-error")).toContainText("Paste a URL first");
    await page.getByLabel("Website URL to auto-record").fill("https://www.linear.app/features");
    await page.getByRole("button", { name: "Auto-record" }).click();
    await expect(page).toHaveURL(/\/projects\/linear-app\/processing$/);
  });

  test("a valid video file starts processing", async ({ page }) => {
    await page.goto("/new");
    await page.getByTestId("file-input").setInputFiles({ name: "Studio Reel.mp4", mimeType: "video/mp4", buffer: Buffer.alloc(1024) });
    await expect(page).toHaveURL(/\/projects\/studio-reel\/processing$/);
  });
});

test.describe("AC3 · dashboard", () => {
  test("filters projects, opens by status and finishes the agency-reel analysis", async ({ page }) => {
    await page.clock.install();
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(", Ada");
    await expect(page.getByRole("region", { name: "Continue learning" })).toContainText("Card stagger · step 1 of 4 · studio-landing");

    const reel = page.getByTestId("project-agency-reel");
    await expect(reel).toContainText("ANALYSING 62%");
    await reel.click();
    await expect(page.getByTestId("toast").filter({ hasText: "Still analysing" })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Ready", exact: true }).click();
    await expect(page.getByTestId("project-studio-landing")).toBeVisible();
    await expect(page.getByTestId("project-agency-reel")).toHaveCount(0);
    await page.getByRole("button", { name: "Processing", exact: true }).click();
    await expect(page.getByTestId("project-agency-reel")).toBeVisible();
    await expect(page.getByTestId("project-studio-landing")).toHaveCount(0);

    await page.clock.runFor(9_000);
    await expect(page.getByTestId("project-agency-reel")).toContainText(/ANALYSING 7\d%/);
    await page.clock.runFor(40_000);
    await expect(page.getByTestId("project-agency-reel")).toHaveCount(0);
    await page.getByRole("button", { name: "Needs review", exact: true }).click();
    await expect(page.getByTestId("project-agency-reel")).toContainText("NEEDS REVIEW");
    await page.getByTestId("project-agency-reel").click();
    await expect(page).toHaveURL(/\/projects\/agency-reel\/review$/);
  });

  test("ready projects open the overview", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("project-studio-landing")).toContainText("edited 2h ago · v7 · 2/5 learned");
    await page.getByTestId("project-studio-landing").click();
    await expect(page).toHaveURL(/\/projects\/studio-landing\/overview$/);
    await expect(page.getByTestId("breadcrumb")).toHaveText("studio-landing / Overview");
  });
});
