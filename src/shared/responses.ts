export function combineResponsesAsMarkdown(responses: string[]): string {
  const sections = responses
    .map((response) => response.trim())
    .filter(Boolean)
    .map((response, index) => `## Response ${index + 1}\n\n${response}`);

  return sections.length ? `${sections.join("\n\n---\n\n")}\n` : "";
}
