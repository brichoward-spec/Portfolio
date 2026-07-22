(async function () {
  try {
    const d = await CMS.loadJSON("/content/about.json");

    const headshot = document.getElementById("headshot-photo");
    if (headshot && d.headshot) headshot.src = d.headshot;

    const bioContainer = document.getElementById("about-bio");
    if (bioContainer && Array.isArray(d.bio)) {
      bioContainer.innerHTML = "";
      d.bio.forEach((paragraph) => {
        bioContainer.appendChild(CMS.el("p", { text: paragraph }));
      });
    }

    const furContainer = document.getElementById("fur-family-groups");
    if (furContainer && Array.isArray(d.fur_family)) {
      furContainer.innerHTML = "";
      const groups = [];
      const byLabel = {};
      d.fur_family.forEach((pet) => {
        if (!byLabel[pet.group]) {
          byLabel[pet.group] = { label: pet.group, pets: [] };
          groups.push(byLabel[pet.group]);
        }
        byLabel[pet.group].pets.push(pet);
      });

      groups.forEach((group) => {
        const groupEl = CMS.el("div", { class: "fur-group" });
        groupEl.appendChild(CMS.el("div", { class: "fur-group-label", text: group.label }));
        const grid = CMS.el("div", { class: "fur-grid" });
        group.pets.forEach((pet) => {
          const item = CMS.el("div", { class: "fur-item" + (pet.remembered ? " remembered" : "") });
          const photo = CMS.el("div", { class: "fur-photo" });
          if (pet.photo) {
            photo.appendChild(
              CMS.el("img", {
                attrs: { src: pet.photo, alt: pet.name },
                style: "width:100%;height:100%;object-fit:cover;",
              })
            );
          }
          item.appendChild(photo);
          item.appendChild(CMS.el("div", { class: "fur-name", text: pet.name }));
          grid.appendChild(item);
        });
        groupEl.appendChild(grid);
        furContainer.appendChild(groupEl);
      });
    }

    CMS.setHtml("contact-heading", CMS.formatText(d.contact_heading || ""));
    CMS.setText("contact-sub", d.contact_sub);
  } catch (e) {
    console.error("Content load failed, showing built-in defaults.", e);
  }
})();
