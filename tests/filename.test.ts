import { createMarkdownFilename, formatTimestampForFilename } from "../src/shared/filename";

describe("filename helpers", () => {
  const date = new Date(2026, 0, 2, 3, 4, 5);

  it("formats timestamps for filenames", () => {
    expect(formatTimestampForFilename(date)).toBe("2026-01-02_03-04-05");
  });

  it("creates a single response filename", () => {
    expect(createMarkdownFilename({ site: "chatgpt", scope: "single", index: 7, date })).toBe(
      "2026-01-02_03-04-05_chatgpt_response-7.md"
    );
  });

  it("creates an all responses filename", () => {
    expect(createMarkdownFilename({ site: "claude", scope: "all", date })).toBe(
      "2026-01-02_03-04-05_claude_responses.md"
    );
  });
});
