import { JSDOM } from "jsdom";
import { domToMarkdown } from "../src/shared/markdown";

function render(html: string): HTMLElement {
  return new JSDOM(`<main>${html}</main>`).window.document.querySelector("main") as HTMLElement;
}

describe("domToMarkdown", () => {
  it("converts headings, paragraphs, links, and emphasis", () => {
    const root = render(`
      <h2>Title</h2>
      <p>Hello <strong>bold</strong> and <em>italic</em> <a href="https://example.com">link</a>.</p>
    `);

    expect(domToMarkdown(root)).toBe(
      "## Title\n\nHello **bold** and *italic* [link](https://example.com).\n"
    );
  });

  it("converts unordered and ordered lists", () => {
    const root = render(`
      <ul>
        <li>Alpha</li>
        <li>Beta<ol><li>One</li><li>Two</li></ol></li>
      </ul>
    `);

    expect(domToMarkdown(root)).toBe("- Alpha\n- Beta\n  1. One\n  2. Two\n");
  });

  it("converts code blocks with language classes", () => {
    const root = render(`<pre><code class="language-ts">const value = 1;
</code></pre>`);

    expect(domToMarkdown(root)).toBe("```ts\nconst value = 1;\n```\n");
  });

  it("converts blockquotes", () => {
    const root = render("<blockquote><p>Quoted text</p></blockquote>");

    expect(domToMarkdown(root)).toBe("> Quoted text\n");
  });

  it("converts tables", () => {
    const root = render(`
      <table>
        <tr><th>Name</th><th>Value</th></tr>
        <tr><td>A</td><td>1</td></tr>
      </table>
    `);

    expect(domToMarkdown(root)).toBe("| Name | Value |\n| --- | --- |\n| A | 1 |\n");
  });
});
