import { createMarkdownFilename } from "../shared/filename";
import { DOWNLOAD_MARKDOWN, type Ai2mdMessage, type DownloadMarkdownMessage } from "../shared/messages";

chrome.runtime.onMessage.addListener((message: Ai2mdMessage, _sender, sendResponse) => {
  if (message.type !== DOWNLOAD_MARKDOWN) {
    return;
  }

  downloadMarkdown(message)
    .then(() => {
      sendResponse({ ok: true });
    })
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });

  return true;
});

async function downloadMarkdown(message: DownloadMarkdownMessage): Promise<void> {
  const markdown = message.payload.markdown.trim();

  if (!markdown) {
    throw new Error("Markdown content is empty");
  }

  const filename = createMarkdownFilename({
    site: message.payload.site,
    scope: message.payload.scope,
    index: message.payload.index
  });
  const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(`${markdown}\n`)}`;

  await chrome.downloads.download({
    url,
    filename,
    saveAs: true,
    conflictAction: "uniquify"
  });
}
