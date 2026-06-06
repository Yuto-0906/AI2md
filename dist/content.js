var e=new Set([`SCRIPT`,`STYLE`,`NOSCRIPT`,`TEMPLATE`,`BUTTON`]),t=new Set([`ADDRESS`,`ARTICLE`,`ASIDE`,`DIV`,`FIGURE`,`FOOTER`,`FORM`,`HEADER`,`MAIN`,`NAV`,`SECTION`]);function n(e){return w(i(e,r()))}function r(){return{listDepth:0,inPre:!1}}function i(e,t){return Array.from(e.childNodes).map(e=>a(e,t)).join(``)}function a(n,r){if(n.nodeType===Node.TEXT_NODE)return s(n.textContent??``,r);if(n.nodeType!==Node.ELEMENT_NODE)return``;let a=n,p=a.tagName;if(e.has(p)||a.getAttribute(`aria-hidden`)===`true`)return``;if(p.match(/^H[1-6]$/)){let e=Number(p.slice(1));return C(`${`#`.repeat(e)} ${o(a,r)}`)}switch(p){case`P`:return C(o(a,r));case`BR`:return`  
`;case`HR`:return`

---

`;case`STRONG`:case`B`:return c(`**`,o(a,r));case`EM`:case`I`:return c(`*`,o(a,r));case`S`:case`DEL`:return c(`~~`,o(a,r));case`A`:return l(a,r);case`IMG`:return u(a);case`CODE`:return a.closest(`pre`)?a.textContent??``:d(a.textContent??``);case`PRE`:return f(a);case`BLOCKQUOTE`:return m(a,r);case`UL`:case`OL`:return h(a,r);case`TABLE`:return _(a,r);case`THEAD`:case`TBODY`:case`TFOOT`:case`TR`:case`TH`:case`TD`:return o(a,r);case`MATH`:return a.textContent??``;default:if(x(a))return S(a);if(t.has(p)){let e=i(a,r);return e.trim()?`\n\n${e}\n\n`:``}return i(a,r)}}function o(e,t){return i(e,t).replace(/[ \t]*\n[ \t]*/g,` `).replace(/[ \t]{2,}/g,` `).trim()}function s(e,t){return t.inPre?e:e.replace(/\s+/g,` `)}function c(e,t){return t?`${e}${t}${e}`:``}function l(e,t){let n=o(e,t),r=e.getAttribute(`href`);return r?`[${b(n)}](${r})`:n}function u(e){let t=e.getAttribute(`src`);return t?`![${b(e.getAttribute(`alt`)??``)}](${t})`:``}function d(e){let t=Math.max(0,...Array.from(e.matchAll(/`+/g),e=>e[0].length)),n="`".repeat(t+1);return`${n}${e.startsWith("`")||e.endsWith("`")?` ${e} `:e}${n}`}function f(e){let t=e.querySelector(`code`),n=t?.textContent??e.textContent??``;return`\n\n\`\`\`${p(t??e)}\n${n.replace(/\n+$/g,``)}\n\`\`\`\n\n`}function p(e){let t=Array.from(e.classList).find(e=>e.startsWith(`language-`));return t?t.replace(/^language-/,``).trim():``}function m(e,t){return`\n\n${w(i(e,t)).trimEnd().split(`
`).map(e=>e?`> ${e}`:`>`).join(`
`)}\n\n`}function h(e,t){let n=e.tagName===`OL`,r=Array.from(e.children).filter(e=>e.tagName===`LI`),i=`  `.repeat(t.listDepth);return`\n\n${r.map((e,r)=>{let o=n?`${r+1}. `:`- `,s=Array.from(e.childNodes).filter(e=>e.nodeType!==Node.ELEMENT_NODE||![`UL`,`OL`].includes(e.tagName)),c=Array.from(e.children).filter(e=>[`UL`,`OL`].includes(e.tagName)),l=g(s.map(e=>a(e,t)).join(``).replace(/\n{2,}/g,`
`).trim(),i.length+o.length),u=c.map(e=>h(e,{...t,listDepth:t.listDepth+1}).replace(/^\n+|\n+$/g,``)).join(`
`);return`${i}${o}${l}${u?`\n${u}`:``}`}).join(`
`)}\n\n`}function g(e,t){let n=` `.repeat(t);return e.split(`
`).map((e,t)=>t===0?e:`${n}${e}`).join(`
`)}function _(e,t){let n=Array.from(e.querySelectorAll(`tr`)).map(e=>Array.from(e.children).filter(e=>[`TH`,`TD`].includes(e.tagName)).map(e=>y(o(e,t)))).filter(e=>e.length>0);if(n.length===0)return``;let r=Math.max(...n.map(e=>e.length)),i=n.map(e=>v(e,r));return`\n\n${[i[0],Array.from({length:r},()=>`---`),...i.slice(1)].map(e=>`| ${e.join(` | `)} |`).join(`
`)}\n\n`}function v(e,t){return Array.from({length:t},(t,n)=>e[n]??``)}function y(e){return e.replace(/\|/g,`\\|`).replace(/\n+/g,`<br>`)}function b(e){return e.replace(/]/g,`\\]`)}function x(e){return e.classList.contains(`katex`)||e.classList.contains(`katex-display`)}function S(e){let t=e.querySelector(`annotation[encoding="application/x-tex"]`)?.textContent?.trim();return t?e.classList.contains(`katex-display`)?`\n\n$$\n${t}\n$$\n\n`:`$${t}$`:e.textContent??``}function C(e){return e?`\n\n${e}\n\n`:``}function w(e){let t=e.replace(/\u00a0/g,` `).replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).trim();return t?`${t}\n`:``}function T(e){let t=``;try{t=new URL(e).hostname.toLowerCase()}catch{return null}return t===`chatgpt.com`||t.endsWith(`.chatgpt.com`)||t===`chat.openai.com`||t.endsWith(`.chat.openai.com`)?`chatgpt`:t===`claude.ai`||t.endsWith(`.claude.ai`)?`claude`:t===`gemini.google.com`||t.endsWith(`.gemini.google.com`)||t===`bard.google.com`||t.endsWith(`.bard.google.com`)?`gemini`:null}function E(e){let t=T(e);return t?t===`chatgpt`?j:t===`claude`?M:N:null}function D(e){let t=new Set;return e.filter(e=>t.has(e.container)||!O(e.content)?!1:(t.add(e.container),!0))}function O(e){return!!e.textContent?.replace(/\s+/g,``).trim()}function k(e,t){for(let n of t){let t=e.querySelector(n);if(t instanceof HTMLElement)return t}return null}function A(e,t){for(let n of t){let t=e.closest(n);if(t instanceof HTMLElement)return t}return e}var j={site:`chatgpt`,findResponses(e=document){let t=[],n=Array.from(e.querySelectorAll(`[data-message-author-role="assistant"]`));for(let e of n){let n=A(e,[`article`,`[data-testid^="conversation-turn-"]`]),r=k(e,[`.markdown`,`.prose`,`[data-message-id]`])??k(n,[`.markdown`,`.prose`])??e;t.push({container:n,content:r})}if(t.length===0)for(let n of Array.from(e.querySelectorAll(`article`))){if(n.querySelector(`[data-message-author-role="user"]`))continue;let e=k(n,[`.markdown`,`.prose`]);e&&t.push({container:n,content:e})}return D(t)}},M={site:`claude`,findResponses(e=document){let t=[`[data-testid="assistant-message"]`,`[data-is-streaming="false"] .font-claude-message`,`.font-claude-message`,`[data-testid="message"] [data-testid="markdown"]`],n=[];for(let r of t){for(let t of Array.from(e.querySelectorAll(r))){let e=A(t,[`[data-testid="message"]`,`[data-testid="assistant-message"]`,`article`,`.group`]);n.push({container:e,content:t})}if(n.length>0)break}return D(n)}},N={site:`gemini`,findResponses(e=document){let t=[`message-content.model-response-text`,`.model-response-text`,`[data-testid="model-response"]`,`response-container message-content`,`model-response message-content`],n=[];for(let r of t){for(let t of Array.from(e.querySelectorAll(r))){let e=A(t,[`response-container`,`model-response`,`.response-container`,`[data-testid="conversation-turn"]`,`article`]);n.push({container:e,content:t})}if(n.length>0)break}return D(n)}},P=`AI2MD_DOWNLOAD_MARKDOWN`,F=`AI2MD_COLLECT_RESPONSES`,I=`data-ai2md-export-button`,L=`data-ai2md-toolbar`,R=`ai2md-style`,z=!1,B=null;X(),V(),B=new MutationObserver(()=>{V()}),B.observe(document.documentElement,{childList:!0,subtree:!0}),G();function V(){z||(z=!0,window.requestAnimationFrame(()=>{z=!1,H()}))}function H(){let e=E(window.location.href);e&&e.findResponses().forEach((t,n)=>{if(t.container.querySelector(`[${I}]`))return;let r=U(t),i=document.createElement(`button`);i.type=`button`,i.textContent=`MD`,i.title=`Save as Markdown`,i.setAttribute(I,`true`),i.addEventListener(`click`,r=>{r.preventDefault(),r.stopPropagation(),W(t,e.site,n+1,i)}),r.append(i)})}function U(e){let t=e.container.querySelector(`[${L}]`);if(t instanceof HTMLElement)return t;let n=document.createElement(`div`);return n.setAttribute(L,`true`),(e.content.parentElement??e.container).insertBefore(n,e.content.nextSibling),n}function W(e,t,r,i){let a=n(e.content).trim();if(!a){Y(i,`Empty`);return}try{if(!K()){J(),Y(i,`Reload`);return}chrome.runtime.sendMessage({type:P,payload:{site:t,markdown:a,scope:`single`,index:r}},e=>{if(q()||!e?.ok){Y(i,`Error`);return}Y(i,`Saved`)})}catch{J(),Y(i,`Reload`)}}function G(){try{if(!K()){J();return}chrome.runtime.onMessage.addListener((e,t,r)=>{if(e.type!==F)return;let i=E(window.location.href);if(!i){r({ok:!1,error:`Unsupported site`});return}let a=i.findResponses().map(e=>n(e.content).trim()).filter(Boolean);r({ok:!0,site:i.site,responses:a})})}catch{J()}}function K(){try{return!!chrome.runtime?.id}catch{return!1}}function q(){try{return chrome.runtime.lastError?.message??null}catch{return J(),`Extension context invalidated`}}function J(){B?.disconnect(),document.querySelectorAll(`[${I}]`).forEach(e=>{e.disabled=!0,e.textContent=`Reload`,e.title=`Reload this tab after reloading the extension`})}function Y(e,t){let n=e.textContent??`MD`;e.textContent=t,e.disabled=!0,window.setTimeout(()=>{e.textContent=n,e.disabled=!1},1200)}function X(){if(document.getElementById(R))return;let e=document.createElement(`style`);e.id=R,e.textContent=`
    [${L}] {
      align-items: center;
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      margin-top: 6px;
      min-height: 28px;
    }

    [${I}] {
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

    [${I}]:hover {
      background: #f3f4f6;
      border-color: rgba(31, 41, 55, 0.38);
    }

    [${I}]:disabled {
      cursor: default;
      opacity: 0.72;
    }
  `,document.documentElement.append(e)}