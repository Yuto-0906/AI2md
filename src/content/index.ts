import { COLLECT_RESPONSES, DOWNLOAD_MARKDOWN, type Ai2mdMessage } from "../shared/messages";
import { domToMarkdown } from "../shared/markdown";
import { getAdapterForUrl, type ResponseNode } from "./adapters";

const BUTTON_ATTRIBUTE = "data-ai2md-export-button";
const TOOLBAR_ATTRIBUTE = "data-ai2md-toolbar";
const STYLE_ID = "ai2md-style";

let scheduled = false;

injectStyle();
scheduleEnhancement();

const observer = new MutationObserver(() => {
  scheduleEnhancement();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

chrome.runtime.onMessage.addListener((message: Ai2mdMessage, _sender, sendResponse) => {
  if (message.type !== COLLECT_RESPONSES) {
    return;
  }

  const adapter = getAdapterForUrl(window.location.href);

  if (!adapter) {
    sendResponse({ ok: false, error: "Unsupported site" });
    return;
  }

  const responses = adapter
    .findResponses()
    .map((response) => domToMarkdown(response.content).trim())
    .filter(Boolean);

  sendResponse({
    ok: true,
    site: adapter.site,
    responses
  });
});

function scheduleEnhancement(): void {
  if (scheduled) {
    return;
  }

  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    enhanceResponses();
  });
}

function enhanceResponses(): void {
  const adapter = getAdapterForUrl(window.location.href);

  if (!adapter) {
    return;
  }

  adapter.findResponses().forEach((response, index) => {
    if (response.container.querySelector(`[${BUTTON_ATTRIBUTE}]`)) {
      return;
    }

    const toolbar = getOrCreateToolbar(response);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "MD";
    button.title = "Markdownとして保存";
    button.setAttribute(BUTTON_ATTRIBUTE, "true");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      downloadSingleResponse(response, adapter.site, index + 1, button);
    });

    toolbar.append(button);
  });
}

function getOrCreateToolbar(response: ResponseNode): HTMLElement {
  const existing = response.container.querySelector(`[${TOOLBAR_ATTRIBUTE}]`);

  if (existing instanceof HTMLElement) {
    return existing;
  }

  const toolbar = document.createElement("div");
  toolbar.setAttribute(TOOLBAR_ATTRIBUTE, "true");

  const parent = response.content.parentElement ?? response.container;
  parent.insertBefore(toolbar, response.content.nextSibling);

  return toolbar;
}

function downloadSingleResponse(
  response: ResponseNode,
  site: "chatgpt" | "claude" | "gemini",
  index: number,
  button: HTMLButtonElement
): void {
  const markdown = domToMarkdown(response.content).trim();

  if (!markdown) {
    flashButton(button, "Empty");
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: DOWNLOAD_MARKDOWN,
      payload: {
        site,
        markdown,
        scope: "single",
        index
      }
    },
    (result?: { ok?: boolean; error?: string }) => {
      if (chrome.runtime.lastError || !result?.ok) {
        flashButton(button, "Error");
        return;
      }

      flashButton(button, "Saved");
    }
  );
}

function flashButton(button: HTMLButtonElement, label: string): void {
  const original = button.textContent ?? "MD";
  button.textContent = label;
  button.disabled = true;

  window.setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1200);
}

function injectStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [${TOOLBAR_ATTRIBUTE}] {
      align-items: center;
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      margin-top: 6px;
      min-height: 28px;
    }

    [${BUTTON_ATTRIBUTE}] {
      appearance: none;
      background: #ffffff;
      border: 1px solid rgba(31, 41, 55, 0.22);
      border-radius: 6px;
      color: #111827;
      cursor: pointer;
      font: 600 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 26px;
      padding: 4px 8px;
    }

    [${BUTTON_ATTRIBUTE}]:hover {
      background: #f3f4f6;
      border-color: rgba(31, 41, 55, 0.38);
    }

    [${BUTTON_ATTRIBUTE}]:disabled {
      cursor: default;
      opacity: 0.72;
    }
  `;

  document.documentElement.append(style);
}
