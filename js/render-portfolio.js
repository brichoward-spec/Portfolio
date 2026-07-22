(async function () {
  try {
    const [d, gallery] = await Promise.all([
      CMS.loadJSON("/content/portfolio.json"),
      CMS.loadJSON("/content/gallery.json"),
    ]);

    CMS.setText("hero-eyebrow", d.eyebrow);
    CMS.setHtml("hero-h1", CMS.formatText(d.h1 || ""));
    CMS.setText("hero-sub", d.sub);
    CMS.setText("approach-heading", d.approach_heading);
    CMS.setText("pull-quote", d.pull_quote ? '"' + d.pull_quote + '"' : "");

    // Material icons are fixed decoration per slot (six bespoke SVGs) — only
    // the name/count text is dynamic. If materials are reordered or the list
    // grows past six, later items reuse the last icon rather than inventing
    // new art. See NEXT-STEPS.md.
    if (Array.isArray(d.materials)) {
      const slots = document.querySelectorAll("#materials-list .spot-item");
      d.materials.forEach((m, i) => {
        const slot = slots[Math.min(i, slots.length - 1)];
        if (!slot) return;
        const name = slot.querySelector(".name");
        const count = slot.querySelector(".count");
        if (name) name.textContent = m.name;
        if (count) count.textContent = m.count + " pieces";
      });
    }

    const toolsGrid = document.getElementById("tools-list");
    if (toolsGrid && Array.isArray(d.tools)) {
      const colors = ["glow1", "glow2", "glow3", "glow4", "glow5", "glow6"];
      toolsGrid.innerHTML = "";
      d.tools.forEach((tool, i) => {
        toolsGrid.appendChild(
          CMS.el("span", {
            class: "tool-chip",
            text: tool,
            style: "--c: var(--" + colors[i % colors.length] + ")",
          })
        );
      });
    }

    const galleryGrid = document.getElementById("gallery-grid");
    if (galleryGrid && gallery && Array.isArray(gallery.items)) {
      galleryGrid.innerHTML = "";
      gallery.items.forEach((piece) => {
        const card = CMS.el("div", { class: "piece" });
        if (piece.image) {
          card.appendChild(
            CMS.el("div", {
              class: "piece-art filled",
              style: "background-image: url('" + piece.image + "');",
            })
          );
        }
        const body = CMS.el("div", { class: "piece-body" });
        body.appendChild(
          CMS.el("span", {
            class: "tag",
            text: piece.tag,
            style: "background: var(--" + (piece.color || "glow1") + ");",
          })
        );
        card.appendChild(body);
        galleryGrid.appendChild(card);
      });

      const COLLAPSE_AT = 8;
      const existingToggle = document.getElementById("gallery-toggle");
      if (existingToggle) existingToggle.remove();

      if (gallery.items.length > COLLAPSE_AT) {
        galleryGrid.classList.add("collapsed");
        const expandedLabel = "Show fewer ↑";
        const collapsedLabel = "Show all " + gallery.items.length + " pieces ↓";
        const toggle = CMS.el("button", {
          class: "gallery-toggle",
          text: collapsedLabel,
          attrs: { id: "gallery-toggle", type: "button" },
        });
        toggle.addEventListener("click", () => {
          const isCollapsed = galleryGrid.classList.toggle("collapsed");
          toggle.textContent = isCollapsed ? collapsedLabel : expandedLabel;
          if (isCollapsed) galleryGrid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        galleryGrid.insertAdjacentElement("afterend", toggle);
      }
    }

    CMS.setHtml("contact-heading", CMS.formatText(d.contact_heading || ""));
    CMS.setText("contact-sub", d.contact_sub);
  } catch (e) {
    console.error("Content load failed, showing built-in defaults.", e);
  }
})();
