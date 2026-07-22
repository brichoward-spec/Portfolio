// Bulk-imports the sorted art library into content/gallery.json + img/uploads.
// Source: Onsite/Art/<Category>/{Edited,From Instagram}/<file>.jpg
// "From Instagram" filenames are already descriptive ("Title - medium.jpg");
// "Edited" filenames are raw camera/screenshot names with no title info, so
// those get a generic "<Category> N" title the owner can rename in the CMS.
const fs = require("fs");
const path = require("path");

const srcRoot = path.join(__dirname, "..", "..", "Onsite", "Art");
const outDir = path.join(__dirname, "..", "img", "uploads");
const galleryPath = path.join(__dirname, "..", "content", "gallery.json");

const categoryMeta = {
  "Paintings": { slug: "paintings", singular: "Painting", color: "glow1" },
  "Illustration": { slug: "illustration", singular: "Illustration", color: "glow2" },
  "Clay and Sculpture": { slug: "clay-sculpture", singular: "Sculpture", color: "glow4" },
  "Resin, Wood and Functional Crafts": { slug: "resin-wood-crafts", singular: "Wood Craft", color: "glow5" },
};

const imageExt = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const items = [];
const skipped = [];

for (const category of Object.keys(categoryMeta)) {
  const meta = categoryMeta[category];
  const catDir = path.join(srcRoot, category);
  if (!fs.existsSync(catDir)) continue;

  let counter = 0;
  const subdirs = fs.readdirSync(catDir, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const sub of subdirs) {
    const subPath = path.join(catDir, sub.name);
    const files = fs.readdirSync(subPath).filter((f) => imageExt.has(path.extname(f).toLowerCase()));

    for (const file of files) {
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      let title, tagDetail;

      if (sub.name === "From Instagram" && base.includes(" - ")) {
        const parts = base.split(" - ");
        title = parts[0].trim();
        tagDetail = parts.slice(1).join(" - ").trim();
        title = tagDetail ? `${title} (${tagDetail})` : title;
      } else {
        counter++;
        title = `${meta.singular} ${counter}`;
      }

      counter = sub.name !== "From Instagram" ? counter : counter;
      const outName = `gallery-${meta.slug}-${items.filter((i) => i._cat === category).length + 1}${ext.toLowerCase()}`;
      const srcFile = path.join(subPath, file);
      const outFile = path.join(outDir, outName);
      fs.copyFileSync(srcFile, outFile);

      items.push({
        title,
        image: `/img/uploads/${outName}`,
        tag: category,
        color: meta.color,
        _cat: category,
      });
    }
  }
}

// drop the internal grouping field before writing
const cleanItems = items.map(({ _cat, ...rest }) => rest);
fs.writeFileSync(galleryPath, JSON.stringify({ items: cleanItems }, null, 2) + "\n");

const counts = {};
for (const it of items) counts[it.tag] = (counts[it.tag] || 0) + 1;
console.log("Imported:", counts);
console.log("Total:", items.length);
if (skipped.length) console.log("Skipped:", skipped);
