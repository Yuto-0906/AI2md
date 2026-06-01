export type SiteSlug = "chatgpt" | "claude" | "gemini";

export function detectSiteByUrl(url: string): SiteSlug | null {
  let hostname = "";

  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  if (hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com")) {
    return "chatgpt";
  }

  if (hostname === "chat.openai.com" || hostname.endsWith(".chat.openai.com")) {
    return "chatgpt";
  }

  if (hostname === "claude.ai" || hostname.endsWith(".claude.ai")) {
    return "claude";
  }

  if (
    hostname === "gemini.google.com" ||
    hostname.endsWith(".gemini.google.com") ||
    hostname === "bard.google.com" ||
    hostname.endsWith(".bard.google.com")
  ) {
    return "gemini";
  }

  return null;
}
