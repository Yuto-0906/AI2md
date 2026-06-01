import { detectSiteByUrl, type SiteSlug } from "../shared/site";

export interface ResponseNode {
  container: HTMLElement;
  content: HTMLElement;
}

export interface SiteAdapter {
  site: SiteSlug;
  findResponses(root?: ParentNode): ResponseNode[];
}

export function getAdapterForUrl(url: string): SiteAdapter | null {
  const site = detectSiteByUrl(url);

  if (!site) {
    return null;
  }

  if (site === "chatgpt") {
    return chatGptAdapter;
  }

  if (site === "claude") {
    return claudeAdapter;
  }

  return geminiAdapter;
}

function uniqueResponses(responses: ResponseNode[]): ResponseNode[] {
  const seen = new Set<HTMLElement>();

  return responses.filter((response) => {
    if (seen.has(response.container) || !hasExportableText(response.content)) {
      return false;
    }

    seen.add(response.container);
    return true;
  });
}

function hasExportableText(element: HTMLElement): boolean {
  return Boolean(element.textContent?.replace(/\s+/g, "").trim());
}

function firstHTMLElement(root: ParentNode, selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const match = root.querySelector(selector);

    if (match instanceof HTMLElement) {
      return match;
    }
  }

  return null;
}

function closestHTMLElement(element: HTMLElement, selectors: string[]): HTMLElement {
  for (const selector of selectors) {
    const match = element.closest(selector);

    if (match instanceof HTMLElement) {
      return match;
    }
  }

  return element;
}

const chatGptAdapter: SiteAdapter = {
  site: "chatgpt",
  findResponses(root = document) {
    const responses: ResponseNode[] = [];
    const messageNodes = Array.from(
      root.querySelectorAll<HTMLElement>('[data-message-author-role="assistant"]')
    );

    for (const message of messageNodes) {
      const container = closestHTMLElement(message, ["article", '[data-testid^="conversation-turn-"]']);
      const content =
        firstHTMLElement(message, [".markdown", ".prose", "[data-message-id]"]) ??
        firstHTMLElement(container, [".markdown", ".prose"]) ??
        message;

      responses.push({ container, content });
    }

    if (responses.length === 0) {
      for (const article of Array.from(root.querySelectorAll<HTMLElement>("article"))) {
        if (article.querySelector('[data-message-author-role="user"]')) {
          continue;
        }

        const content = firstHTMLElement(article, [".markdown", ".prose"]);

        if (content) {
          responses.push({ container: article, content });
        }
      }
    }

    return uniqueResponses(responses);
  }
};

const claudeAdapter: SiteAdapter = {
  site: "claude",
  findResponses(root = document) {
    const selectors = [
      '[data-testid="assistant-message"]',
      '[data-is-streaming="false"] .font-claude-message',
      ".font-claude-message",
      '[data-testid="message"] [data-testid="markdown"]'
    ];
    const responses: ResponseNode[] = [];

    for (const selector of selectors) {
      for (const content of Array.from(root.querySelectorAll<HTMLElement>(selector))) {
        const container = closestHTMLElement(content, [
          '[data-testid="message"]',
          '[data-testid="assistant-message"]',
          "article",
          ".group"
        ]);
        responses.push({ container, content });
      }

      if (responses.length > 0) {
        break;
      }
    }

    return uniqueResponses(responses);
  }
};

const geminiAdapter: SiteAdapter = {
  site: "gemini",
  findResponses(root = document) {
    const selectors = [
      "message-content.model-response-text",
      ".model-response-text",
      '[data-testid="model-response"]',
      "response-container message-content",
      "model-response message-content"
    ];
    const responses: ResponseNode[] = [];

    for (const selector of selectors) {
      for (const content of Array.from(root.querySelectorAll<HTMLElement>(selector))) {
        const container = closestHTMLElement(content, [
          "response-container",
          "model-response",
          ".response-container",
          '[data-testid="conversation-turn"]',
          "article"
        ]);
        responses.push({ container, content });
      }

      if (responses.length > 0) {
        break;
      }
    }

    return uniqueResponses(responses);
  }
};
