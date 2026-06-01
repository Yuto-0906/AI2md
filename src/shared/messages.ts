import type { DownloadScope } from "./filename";
import type { SiteSlug } from "./site";

export const DOWNLOAD_MARKDOWN = "AI2MD_DOWNLOAD_MARKDOWN";
export const COLLECT_RESPONSES = "AI2MD_COLLECT_RESPONSES";

export interface DownloadMarkdownMessage {
  type: typeof DOWNLOAD_MARKDOWN;
  payload: {
    site: SiteSlug;
    markdown: string;
    scope: DownloadScope;
    index?: number;
  };
}

export interface CollectResponsesMessage {
  type: typeof COLLECT_RESPONSES;
}

export interface CollectResponsesResult {
  ok: boolean;
  site?: SiteSlug;
  responses?: string[];
  error?: string;
}

export type Ai2mdMessage = DownloadMarkdownMessage | CollectResponsesMessage;
