import { expect, test, type Page } from "@playwright/test";

const P = "/projects/studio-landing";
const xp = (page: Page) => page.getByTestId("xp-chip-text");
const toast = (page: Page, text: string) => page.getByTestId("toast").filter({ hasText: text });

test.describe("V5 · animations inspector, lesson and challenge", () => {
  test("inspector: select rows, edit the generated duration, save a version, deep links", async ({ page }) => {
    await page.goto(`${P}/animations`);
    await expect(page.getByRole("heading", { name: "Animations" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Animation timeline" }).getByRole("button")).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "Card stagger", level: 2 })).toBeVisible();

    await page.getByTestId("timeline-row-spring").click();
    await expect(page).toHaveURL(/animations\?anim=spring$/);
    await expect(page.getByRole("heading", { name: "Button spring", level: 2 })).toBeVisible();
    const stiffness = page.getByTestId("inspector-row-stiffness");
    await expect(stiffness.getByTestId("observed-value")).toContainText("unknown");
    await expect(stiffness.getByTestId("observed-value")).not.toContainText(/\d/);
    await expect(stiffness).toContainText("400");
    await expect(page.getByText("Unlocks at Lv 6")).toBeVisible();
    await expect(page.getByTestId("generated-duration")).toHaveCount(0);

    await page.getByTestId("timeline-row-hero").click();
    await expect(page.getByText("Learned ✓")).toBeVisible();

    await page.getByTestId("timeline-row-stagger").click();
    await expect(page.getByRole("button", { name: "Saved" })).toBeDisabled();
    await expect(page.getByTestId("generated-duration")).toHaveText("480ms");
    await page.getByRole("button", { name: "Increase generated duration" }).click();
    await page.getByRole("button", { name: "Increase generated duration" }).click();
    await expect(page.getByTestId("generated-duration")).toHaveText("520ms");
    await page.getByRole("button", { name: "Decrease generated duration" }).click();
    await expect(page.getByTestId("generated-duration")).toHaveText("500ms");

    await page.getByRole("button", { name: "Play at quarter speed" }).click();
    await expect(page.getByRole("button", { name: "Play at normal speed" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("inspector-cards-card").first()).toHaveCSS("animation-duration", "2s");
    await page.getByRole("button", { name: "▶ Replay" }).click();

    await page.reload();
    await expect(page.getByTestId("generated-duration")).toHaveText("500ms");
    await page.getByRole("button", { name: "Save as v8" }).click();
    await expect(toast(page, "Saved v8")).toBeVisible();
    await expect(toast(page, "Card stagger · 500ms")).toBeVisible();
    await expect(page.getByRole("button", { name: "Saved" })).toBeDisabled();
    await expect(page.getByRole("link", { name: /History\s*v8/ })).toBeVisible();

    await page.getByRole("link", { name: "Show in recording @ 00:12" }).click();
    await expect(page).toHaveURL(/overview\?t=12$/);
    await expect(page.getByTestId("time-label")).toHaveText("00:12 / 00:48");
    await page.goBack();
    await page.getByRole("link", { name: "Open code ↗" }).click();
    await expect(page).toHaveURL(/\/build$/);

    await page.getByRole("link", { name: /History/ }).click();
    await expect(page.getByTestId("version-v8")).toContainText("Inspector edit");
    await expect(page.getByTestId("version-v8")).toContainText("Card stagger duration 480 → 500ms");
  });

  test("lesson through all four steps, then fail and pass the challenge; XP is granted once", async ({ page }) => {
    await page.goto(`${P}/animations?anim=stagger`);
    await expect(xp(page)).toContainText("1,240 XP");
    await page.getByRole("button", { name: "Learn it · +60 XP" }).click();
    await expect(page).toHaveURL(/\/learn$/);

    await expect(page.getByTestId("lesson-eyebrow")).toHaveText("CARD STAGGER · STEP 1 OF 4 · INTERMEDIATE");
    await expect(page.getByRole("heading", { name: "Three cards, one after another" })).toBeVisible();
    await page.getByRole("button", { name: "↻ Replay" }).click();
    await page.getByRole("button", { name: "Next: play with it →" }).click();

    await expect(page.getByTestId("lesson-eyebrow")).toContainText("STEP 2 OF 4");
    await expect(page.getByTestId("bezier-path")).toHaveAttribute("d", "M 10 90 C 10 90, 26 10, 90 10");
    await page.getByRole("group", { name: "Easing" }).getByRole("button", { name: "linear" }).click();
    await expect(page.getByTestId("bezier-path")).toHaveAttribute("d", "M 10 90 C 10 90, 90 10, 90 10");
    await page.getByLabel("stagger").fill("0");
    await page.getByLabel("duration").fill("600");
    await expect(page.getByTestId("playground-css")).toContainText("transform 600ms linear");
    await expect(page.getByTestId("playground-css")).toContainText("calc(var(--i) * 0ms)");

    await page.reload();
    await expect(page.getByTestId("lesson-eyebrow")).toContainText("STEP 2 OF 4");
    await page.getByRole("button", { name: "Next: read the code →" }).click();

    await expect(page.getByTestId("walk-text")).toContainText("The parent tells each child to start 0.09s after the previous one.");
    await page.getByRole("button", { name: "Beginner" }).click();
    await expect(page.getByTestId("walk-text")).toContainText("The list tells each card to start 0.09 seconds after the one before it.");
    await page.getByRole("button", { name: "Advanced" }).click();
    await expect(page.getByTestId("lesson-eyebrow")).toContainText("ADVANCED");
    await expect(page.getByTestId("walk-text")).toContainText("staggerChildren offsets each child's delay by its index.");
    await page.getByRole("button", { name: /Explain line 7/ }).click();
    await expect(page.getByTestId("walk-text")).toContainText("Line 7.");
    await page.getByRole("button", { name: "← Prev" }).click();
    await expect(page.getByTestId("walk-text")).toContainText("Line 5.");
    await page.getByRole("button", { name: "Why ease-out and not linear?" }).click();
    await expect(page.getByTestId("tutor-answer")).toContainText("Real objects slow down before they stop.");
    await page.getByRole("button", { name: "Next line →" }).click();
    await page.getByRole("button", { name: "Next line →" }).click();
    await page.getByRole("button", { name: "Next: quick check →" }).click();

    await expect(page.getByRole("heading", { name: "Quick check" })).toBeVisible();
    await page.getByRole("button", { name: "900ms" }).click();
    await expect(page.getByRole("button", { name: "900ms" })).toContainText("try again");
    await expect(page.getByTestId("quiz-feedback")).toContainText("Too long.");
    await expect(page.getByRole("button", { name: /Finish lesson/ })).toHaveCount(0);
    await page.getByRole("button", { name: "90ms" }).click();
    await expect(page.getByRole("button", { name: "90ms" })).toContainText("correct");
    await page.getByRole("button", { name: "Finish lesson · +60 XP" }).click();

    await expect(page).toHaveURL(/\/learn\/challenge$/);
    await expect(toast(page, "+60 XP")).toBeVisible();
    await expect(xp(page)).toContainText("1,300 XP");
    await expect(page.getByRole("link", { name: /Learn\s*3\/5/ })).toBeVisible();

    await expect(page.getByTestId("attempt-label")).toHaveText("CHALLENGE · ATTEMPT 1");
    await expect(page.getByTestId("score-total")).toHaveText("—/100");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByTestId("score-total")).toHaveText("47/100");
    await expect(page.getByTestId("score-row-Duration")).toContainText("✗ 55");
    await expect(page.getByTestId("score-row-Stagger")).toContainText("✗ 1");
    await expect(page.getByTestId("score-row-Easing")).toContainText("✗ 30");
    await expect(page.getByTestId("score-message")).toContainText("Stagger is the furthest off.");
    await expect(page.getByTestId("attempt-label")).toHaveText("CHALLENGE · ATTEMPT 1");
    await expect(page.getByRole("link", { name: "Ship the project →" })).toHaveCount(0);

    await page.getByRole("group", { name: "Easing" }).getByRole("button", { name: "ease-out" }).click();
    await page.getByLabel("duration").fill("480");
    await page.getByLabel("stagger").fill("90");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByTestId("score-total")).toHaveText("100/100");
    await expect(page.getByTestId("attempt-label")).toHaveText("CHALLENGE · ATTEMPT 2");
    await expect(toast(page, "+200 XP")).toBeVisible();
    await expect(xp(page)).toContainText("1,500 XP");
    await expect(page.getByTestId("score-message")).toContainText("Passed. Easing badge earned.");

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByTestId("attempt-label")).toHaveText("CHALLENGE · ATTEMPT 3");
    await expect(xp(page)).toContainText("1,500 XP");

    await page.reload();
    await expect(page.getByTestId("score-total")).toHaveText("100/100");
    await expect(xp(page)).toContainText("1,500 XP");
    await page.getByRole("link", { name: "Ship the project →" }).click();
    await expect(page).toHaveURL(/\/export$/);

    await page.goto(`${P}/animations?anim=stagger`);
    await expect(page.getByText("Learned ✓")).toBeVisible();
    await page.goto("/dashboard");
    await expect(page.getByText("CONTINUE LEARNING")).toHaveCount(0);
  });

  test("a hint lowers the challenge award to 180 XP", async ({ page }) => {
    await page.goto(`${P}/learn`);
    await page.getByRole("button", { name: "4 · Check" }).click();
    await page.getByRole("button", { name: "90ms" }).click();
    await page.getByRole("button", { name: "Finish lesson · +60 XP" }).click();
    await expect(xp(page)).toContainText("1,300 XP");

    await page.getByRole("button", { name: "Hint (−20 XP)" }).click();
    await expect(page.getByTestId("hint")).toContainText("Watch how the original stops");
    await expect(page.getByRole("button", { name: "Hint used (−20 XP)" })).toBeDisabled();
    await page.getByRole("group", { name: "Easing" }).getByRole("button", { name: "ease-out" }).click();
    await page.getByLabel("duration").fill("480");
    await page.getByLabel("stagger").fill("90");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(toast(page, "+180 XP")).toBeVisible();
    await expect(xp(page)).toContainText("1,480 XP");
  });
});
