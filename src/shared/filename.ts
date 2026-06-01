import type { SiteSlug } from "./site";

export type DownloadScope = "single" | "all";

export interface FilenameOptions {
  site: SiteSlug;
  scope: DownloadScope;
  date?: Date;
  index?: number;
}

export function formatTimestampForFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

export function createMarkdownFilename(options: FilenameOptions): string {
  const timestamp = formatTimestampForFilename(options.date);

  if (options.scope === "all") {
    return `${timestamp}_${options.site}_responses.md`;
  }

  const index = Number.isFinite(options.index) && options.index ? options.index : 1;
  return `${timestamp}_${options.site}_response-${index}.md`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
