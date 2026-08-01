// Imports "FB Art section" (old Facebook-era art exports) into the gallery,
// skipping anything already on the site (by content hash) and any internal
// duplicates within the folder itself (old FB albums sometimes re-uploaded
// the same photo).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const srcDir = path.join(__dirname, "..", "..", "Portfolio Images", "FB Art section");
const outDir = path.join(__dirname, "..", "img", "uploads");
const galleryPath = path.join(__dirname, "..", "content", "gallery.json");

function hashFile(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

// Index everything already on the site
const existingHashes = new Set();
for (const f of fs.readdirSync(outDir)) {
  existingHashes.add(hashFile(path.join(outDir, f)));
}

const data = JSON.parse(fs.readFileSync(galleryPath, "utf8"));
let nextIndex = data.items.filter((i) => i.tag === "Early Work").length + 1;

const seenInBatch = new Set();
let imported = 0;
let skippedExisting = 0;
let skippedInternalDupe = 0;

const files = fs.readdirSync(srcDir).filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f));

for (const file of files) {
  const fullPath = path.join(srcDir, file);
  const hash = hashFile(fullPath);

  if (existingHashes.has(hash)) {
    skippedExisting++;
    continue;
  }
  if (seenInBatch.has(hash)) {
    skippedInternalDupe++;
    continue;
  }
  seenInBatch.add(hash);
  existingHashes.add(hash);

  const ext = path.extname(file).toLowerCase();
  const outName = `gallery-early-work-${nextIndex}${ext}`;
  fs.copyFileSync(fullPath, path.join(outDir, outName));

  data.items.push({
    title: `Early Work ${nextIndex}`,
    image: `/img/uploads/${outName}`,
    tag: "Early Work",
    color: "glow6",
  });
  nextIndex++;
  imported++;
}

fs.writeFileSync(galleryPath, JSON.stringify(data, null, 2) + "\n");
console.log("Imported:", imported);
console.log("Skipped (already on site):", skippedExisting);
console.log("Skipped (internal duplicate):", skippedInternalDupe);
console.log("Total gallery items now:", data.items.length);
