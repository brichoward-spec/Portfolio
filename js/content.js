// Shared helpers used by every render-*.js. Pages are plain static HTML —
// there's no build step, so content is fetched at runtime from content/*.json
// (the same files the CMS at /admin edits) and used to fill in the page.
window.CMS = (function () {
  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Turns "Got a problem **worth solving weird**?" into escaped HTML with
  // **...** wrapped in <span class="accent">, and newlines into <br>.
  // Lets a non-technical editor mark the accent-colored phrase in a plain
  // text field instead of needing a rich text widget.
  function formatText(str) {
    return escapeHtml(str)
      .replace(/\*\*(.+?)\*\*/g, '<span class="accent">$1</span>')
      .replace(/\n/g, "<br>");
  }

  function el(tag, opts) {
    opts = opts || {};
    const e = document.createElement(tag);
    if (opts.class) e.className = opts.class;
    if (opts.text !== undefined) e.textContent = opts.text;
    if (opts.html !== undefined) e.innerHTML = opts.html;
    if (opts.attrs) for (const k in opts.attrs) e.setAttribute(k, opts.attrs[k]);
    if (opts.style) e.style.cssText = opts.style;
    return e;
  }

  function setText(id, text) {
    const node = document.getElementById(id);
    if (node && text !== undefined) node.textContent = text;
  }

  function setHtml(id, html) {
    const node = document.getElementById(id);
    if (node && html !== undefined) node.innerHTML = html;
  }

  return { loadJSON, escapeHtml, formatText, el, setText, setHtml };
})();
