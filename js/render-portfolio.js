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

    const galleryGroups = document.getElementById("gallery-groups");
    if (galleryGroups && gallery && Array.isArray(gallery.items)) {
      galleryGroups.innerHTML = "";

      // Group by tag/category, preserving first-seen order, so pieces read as
      // "Paintings", "Illustration", etc. instead of one long undifferentiated
      // grid — the tag chip on every card becomes redundant once grouped.
      const groups = [];
      const byTag = {};
      gallery.items.forEach((piece) => {
        const tag = piece.tag || "Work";
        if (!byTag[tag]) {
          byTag[tag] = { tag, pieces: [] };
          groups.push(byTag[tag]);
        }
        byTag[tag].pieces.push(piece);
      });

      const COLLAPSE_AT = 6;

      groups.forEach((group) => {
        const section = CMS.el("div", { class: "gallery-category" });

        const head = CMS.el("div", { class: "gallery-category-head" });
        head.appendChild(CMS.el("h3", { text: group.tag }));
        head.appendChild(CMS.el("span", { class: "count", text: group.pieces.length + " pieces" }));
        section.appendChild(head);

        const grid = CMS.el("div", { class: "gallery-grid" });
        group.pieces.forEach((piece) => {
          const card = CMS.el("div", { class: "piece", attrs: { title: "Click to see the page in color" } });
          if (piece.image) {
            card.appendChild(
              CMS.el("div", {
                class: "piece-art filled",
                style: "background-image: url('" + piece.image + "');",
              })
            );
          }
          grid.appendChild(card);
        });
        section.appendChild(grid);

        if (group.pieces.length > COLLAPSE_AT) {
          grid.classList.add("collapsed");
          const expandedLabel = "Show fewer ↑";
          const collapsedLabel = "Show all " + group.pieces.length + " ↓";
          const toggle = CMS.el("button", {
            class: "gallery-toggle",
            text: collapsedLabel,
            attrs: { type: "button" },
          });
          toggle.addEventListener("click", () => {
            const isCollapsed = grid.classList.toggle("collapsed");
            toggle.textContent = isCollapsed ? collapsedLabel : expandedLabel;
            if (isCollapsed) section.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          section.appendChild(toggle);
        }

        galleryGroups.appendChild(section);
      });
    }

    CMS.setHtml("contact-heading", CMS.formatText(d.contact_heading || ""));
    CMS.setText("contact-sub", d.contact_sub);
  } catch (e) {
    console.error("Content load failed, showing built-in defaults.", e);
  }
})();
