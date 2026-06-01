type MarkdownContext = {
  listDepth: number;
  inPre: boolean;
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "BUTTON"]);
const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "DIV",
  "FIGURE",
  "FOOTER",
  "FORM",
  "HEADER",
  "MAIN",
  "NAV",
  "SECTION"
]);

export function domToMarkdown(root: Element | DocumentFragment): string {
  return normalizeMarkdown(childrenToMarkdown(root, baseContext()));
}

function baseContext(): MarkdownContext {
  return {
    listDepth: 0,
    inPre: false
  };
}

function childrenToMarkdown(parent: ParentNode, context: MarkdownContext): string {
  return Array.from(parent.childNodes)
    .map((node) => nodeToMarkdown(node, context))
    .join("");
}

function nodeToMarkdown(node: Node, context: MarkdownContext): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return textToMarkdown(node.textContent ?? "", context);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tag = element.tagName;

  if (SKIP_TAGS.has(tag) || element.getAttribute("aria-hidden") === "true") {
    return "";
  }

  if (tag.match(/^H[1-6]$/)) {
    const level = Number(tag.slice(1));
    return block(`${"#".repeat(level)} ${inlineChildren(element, context)}`);
  }

  switch (tag) {
    case "P":
      return block(inlineChildren(element, context));
    case "BR":
      return "  \n";
    case "HR":
      return "\n\n---\n\n";
    case "STRONG":
    case "B":
      return wrapInline("**", inlineChildren(element, context));
    case "EM":
    case "I":
      return wrapInline("*", inlineChildren(element, context));
    case "S":
    case "DEL":
      return wrapInline("~~", inlineChildren(element, context));
    case "A":
      return linkToMarkdown(element, context);
    case "IMG":
      return imageToMarkdown(element);
    case "CODE":
      if (element.closest("pre")) {
        return element.textContent ?? "";
      }
      return inlineCode(element.textContent ?? "");
    case "PRE":
      return preToMarkdown(element);
    case "BLOCKQUOTE":
      return blockquoteToMarkdown(element, context);
    case "UL":
    case "OL":
      return listToMarkdown(element, context);
    case "TABLE":
      return tableToMarkdown(element, context);
    case "THEAD":
    case "TBODY":
    case "TFOOT":
    case "TR":
    case "TH":
    case "TD":
      return inlineChildren(element, context);
    case "MATH":
      return element.textContent ?? "";
    default:
      if (isKatexElement(element)) {
        return katexToMarkdown(element);
      }

      if (BLOCK_TAGS.has(tag)) {
        const markdown = childrenToMarkdown(element, context);
        return markdown.trim() ? `\n\n${markdown}\n\n` : "";
      }

      return childrenToMarkdown(element, context);
  }
}

function inlineChildren(element: HTMLElement, context: MarkdownContext): string {
  return childrenToMarkdown(element, context)
    .replace(/[ \t]*\n[ \t]*/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function textToMarkdown(text: string, context: MarkdownContext): string {
  if (context.inPre) {
    return text;
  }

  return text.replace(/\s+/g, " ");
}

function wrapInline(marker: string, content: string): string {
  return content ? `${marker}${content}${marker}` : "";
}

function linkToMarkdown(element: HTMLElement, context: MarkdownContext): string {
  const text = inlineChildren(element, context);
  const href = element.getAttribute("href");

  if (!href) {
    return text;
  }

  return `[${escapeMarkdownLinkText(text)}](${href})`;
}

function imageToMarkdown(element: HTMLElement): string {
  const src = element.getAttribute("src");

  if (!src) {
    return "";
  }

  const alt = element.getAttribute("alt") ?? "";
  return `![${escapeMarkdownLinkText(alt)}](${src})`;
}

function inlineCode(text: string): string {
  const maxRun = Math.max(0, ...Array.from(text.matchAll(/`+/g), (match) => match[0].length));
  const fence = "`".repeat(maxRun + 1);
  const needsPadding = text.startsWith("`") || text.endsWith("`");
  const content = needsPadding ? ` ${text} ` : text;

  return `${fence}${content}${fence}`;
}

function preToMarkdown(element: HTMLElement): string {
  const codeElement = element.querySelector("code");
  const code = codeElement?.textContent ?? element.textContent ?? "";
  const language = getCodeLanguage(codeElement ?? element);

  return `\n\n\`\`\`${language}\n${code.replace(/\n+$/g, "")}\n\`\`\`\n\n`;
}

function getCodeLanguage(element: Element): string {
  const classes = Array.from(element.classList);
  const languageClass = classes.find((className) => className.startsWith("language-"));

  if (!languageClass) {
    return "";
  }

  return languageClass.replace(/^language-/, "").trim();
}

function blockquoteToMarkdown(element: HTMLElement, context: MarkdownContext): string {
  const markdown = normalizeMarkdown(childrenToMarkdown(element, context));
  const quoted = markdown
    .trimEnd()
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");

  return `\n\n${quoted}\n\n`;
}

function listToMarkdown(element: HTMLElement, context: MarkdownContext): string {
  const ordered = element.tagName === "OL";
  const items = Array.from(element.children).filter((child) => child.tagName === "LI");
  const indent = "  ".repeat(context.listDepth);
  const lines = items.map((item, index) => {
    const marker = ordered ? `${index + 1}. ` : "- ";
    const contentNodes = Array.from(item.childNodes).filter(
      (child) =>
        child.nodeType !== Node.ELEMENT_NODE ||
        !["UL", "OL"].includes((child as HTMLElement).tagName)
    );
    const nestedLists = Array.from(item.children).filter((child) => ["UL", "OL"].includes(child.tagName));
    const content = contentNodes
      .map((child) => nodeToMarkdown(child, context))
      .join("")
      .replace(/\n{2,}/g, "\n")
      .trim();
    const formattedContent = indentContinuation(content, indent.length + marker.length);
    const nested = nestedLists
      .map((child) =>
        listToMarkdown(child as HTMLElement, {
          ...context,
          listDepth: context.listDepth + 1
        }).replace(/^\n+|\n+$/g, "")
      )
      .join("\n");

    return `${indent}${marker}${formattedContent}${nested ? `\n${nested}` : ""}`;
  });

  return `\n\n${lines.join("\n")}\n\n`;
}

function indentContinuation(content: string, spaces: number): string {
  const continuationIndent = " ".repeat(spaces);

  return content
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${continuationIndent}${line}`))
    .join("\n");
}

function tableToMarkdown(element: HTMLElement, context: MarkdownContext): string {
  const rows = Array.from(element.querySelectorAll("tr")).map((row) =>
    Array.from(row.children)
      .filter((cell) => ["TH", "TD"].includes(cell.tagName))
      .map((cell) => escapeTableCell(inlineChildren(cell as HTMLElement, context)))
  );
  const nonEmptyRows = rows.filter((row) => row.length > 0);

  if (nonEmptyRows.length === 0) {
    return "";
  }

  const columnCount = Math.max(...nonEmptyRows.map((row) => row.length));
  const normalizedRows = nonEmptyRows.map((row) => normalizeTableRow(row, columnCount));
  const header = normalizedRows[0];
  const separator = Array.from({ length: columnCount }, () => "---");
  const bodyRows = normalizedRows.slice(1);
  const table = [header, separator, ...bodyRows].map((row) => `| ${row.join(" | ")} |`).join("\n");

  return `\n\n${table}\n\n`;
}

function normalizeTableRow(row: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => row[index] ?? "");
}

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n+/g, "<br>");
}

function escapeMarkdownLinkText(text: string): string {
  return text.replace(/]/g, "\\]");
}

function isKatexElement(element: HTMLElement): boolean {
  return element.classList.contains("katex") || element.classList.contains("katex-display");
}

function katexToMarkdown(element: HTMLElement): string {
  const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
  const tex = annotation?.textContent?.trim();

  if (!tex) {
    return element.textContent ?? "";
  }

  return element.classList.contains("katex-display") ? `\n\n$$\n${tex}\n$$\n\n` : `$${tex}$`;
}

function block(content: string): string {
  return content ? `\n\n${content}\n\n` : "";
}

function normalizeMarkdown(markdown: string): string {
  const trimmed = markdown
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return trimmed ? `${trimmed}\n` : "";
}
