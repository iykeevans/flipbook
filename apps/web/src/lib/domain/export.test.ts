import { exportActionLabel, shipAwardKey, stackSummary } from "./export";

describe("export helpers", () => {
  it("labels the action per target", () => {
    expect(exportActionLabel("deploy", "studio-landing")).toBe("Deploy studio-landing");
    expect(exportActionLabel("github", "studio-landing")).toBe("Push to GitHub");
    expect(exportActionLabel("zip", "studio-landing")).toBe("Download .zip");
  });

  it("summarises the stack, falling back to HTML/CSS", () => {
    expect(stackSummary(["React", "Tailwind", "Framer Motion"])).toBe("React · Tailwind · Framer Motion");
    expect(stackSummary([])).toBe("HTML/CSS");
  });

  it("keys the ship award by project only", () => {
    expect(shipAwardKey("studio-landing")).toBe("ship:studio-landing");
  });
});
