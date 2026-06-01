import { detectSiteByUrl } from "../src/shared/site";

describe("detectSiteByUrl", () => {
  it("detects ChatGPT URLs", () => {
    expect(detectSiteByUrl("https://chatgpt.com/c/abc")).toBe("chatgpt");
    expect(detectSiteByUrl("https://chat.openai.com/c/abc")).toBe("chatgpt");
  });

  it("detects Claude URLs", () => {
    expect(detectSiteByUrl("https://claude.ai/chat/abc")).toBe("claude");
  });

  it("detects Gemini URLs", () => {
    expect(detectSiteByUrl("https://gemini.google.com/app/abc")).toBe("gemini");
    expect(detectSiteByUrl("https://bard.google.com/chat")).toBe("gemini");
  });

  it("returns null for unsupported URLs", () => {
    expect(detectSiteByUrl("https://example.com")).toBeNull();
    expect(detectSiteByUrl("not a url")).toBeNull();
  });
});
