import "./popup.css";
import { COLLECT_RESPONSES, DOWNLOAD_MARKDOWN, type CollectResponsesResult } from "../shared/messages";
import { combineResponsesAsMarkdown } from "../shared/responses";

const exportButtonElement = document.querySelector<HTMLButtonElement>("#export-all");
const statusElementCandidate = document.querySelector<HTMLElement>("#status");

if (!exportButtonElement || !statusElementCandidate) {
  throw new Error("Popup elements are missing");
}

const exportButton = exportButtonElement;
const statusElement = statusElementCandidate;

exportButton.addEventListener("click", () => {
  exportAllResponses();
});

async function exportAllResponses(): Promise<void> {
  setBusy(true, "抽出しています");

  try {
    const tab = await getActiveTab();

    if (!tab.id) {
      setStatus("アクティブなタブを取得できません");
      return;
    }

    const result = await sendMessageToTab<CollectResponsesResult>(tab.id, {
      type: COLLECT_RESPONSES
    });

    if (!result.ok || !result.site) {
      setStatus(result.error ?? "対応ページで実行してください");
      return;
    }

    const markdown = combineResponsesAsMarkdown(result.responses ?? []);

    if (!markdown) {
      setStatus("AI返答が見つかりません");
      return;
    }

    await sendRuntimeMessage({
      type: DOWNLOAD_MARKDOWN,
      payload: {
        site: result.site,
        markdown,
        scope: "all"
      }
    });

    setStatus("保存を開始しました");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  } finally {
    setBusy(false);
  }
}

function getActiveTab(): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const tab = tabs[0];

      if (!tab) {
        reject(new Error("アクティブなタブがありません"));
        return;
      }

      resolve(tab);
    });
  });
}

function sendMessageToTab<T>(tabId: number, message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

function sendRuntimeMessage(message: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response?: { ok?: boolean; error?: string }) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response?.ok) {
        reject(new Error(response?.error ?? "保存に失敗しました"));
        return;
      }

      resolve();
    });
  });
}

function setBusy(isBusy: boolean, message?: string): void {
  exportButton.disabled = isBusy;

  if (message) {
    setStatus(message);
  }
}

function setStatus(message: string): void {
  statusElement.textContent = message;
}
