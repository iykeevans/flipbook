import { projectNameFromFile, projectNameFromUrl, validateRecordingFile } from "./upload";

const MB = 1024 * 1024;

describe("validateRecordingFile", () => {
  it.each([
    ["site.mp4", "video/mp4"],
    ["site.mov", "video/quicktime"],
    ["site.webm", "video/webm"],
    ["SITE.MOV", ""],
  ])("accepts %s", (name, type) => {
    expect(validateRecordingFile({ name, type, size: 10 * MB })).toBeNull();
  });

  it("rejects other file types", () => {
    expect(validateRecordingFile({ name: "notes.pdf", type: "application/pdf", size: 1000 })).toMatch(/isn't a supported video/);
  });

  it("rejects files over 250 MB but allows exactly 250 MB", () => {
    expect(validateRecordingFile({ name: "big.mp4", type: "video/mp4", size: 250 * MB })).toBeNull();
    expect(validateRecordingFile({ name: "big.mp4", type: "video/mp4", size: 251 * MB })).toBe("big.mp4 is 251 MB. Recordings can be up to 250 MB.");
  });
});

describe("project names", () => {
  it("derives a slug from a file or URL", () => {
    expect(projectNameFromFile("My Site Recording.mp4")).toBe("my-site-recording");
    expect(projectNameFromUrl("https://www.Linear.app/features")).toBe("linear-app");
    expect(projectNameFromUrl("stripe.com")).toBe("stripe-com");
  });
});
