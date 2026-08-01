// Cross-checks every file under "Portfolio Images" against what's already
// in img/uploads (the site), using SHA256 content hashes so we don't rely on
// filenames (which differ between the two folder trees for the same photo).
// Also finds internal duplicates already sitting in img/uploads (e.g. the
// "man in chair" painting reported twice).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..", "..");
const sourceRoot = path.join(root, "Portfolio Images");
const uploadsDir = path.join(__dirname, "..", "img", "uploads");

const imageExt = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function hashFile(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (imageExt.has(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// Index everything currently on the site
const existingFiles = walk(uploadsDir);
const existingByHash = {};
for (const f of existingFiles) {
  const h = hashFile(f);
  if (!existingByHash[h]) existingByHash[h] = [];
  existingByHash[h].push(path.relative(uploadsDir, f));
}

// Find internal duplicates already on the site
const internalDupes = Object.entries(existingByHash).filter(([, files]) => files.length > 1);

// Index every source file, deduped by hash within the source tree itself
const sourceFiles = walk(sourceRoot);
const sourceByHash = {};
for (const f of sourceFiles) {
  const h = hashFile(f);
  if (!sourceByHash[h]) sourceByHash[h] = [];
  sourceByHash[h].push(path.relative(sourceRoot, f));
}

const newHashes = Object.keys(sourceByHash).filter((h) => !existingByHash[h]);

const report = {
  totalSourceFiles: sourceFiles.length,
  uniqueSourceContent: Object.keys(sourceByHash).length,
  totalExistingFiles: existingFiles.length,
  internalDuplicatesOnSite: internalDupes.map(([h, files]) => ({ hash: h.slice(0, 12), files })),
  newUniqueCount: newHashes.length,
  newFiles: newHashes.map((h) => ({ hash: h.slice(0, 12), paths: sourceByHash[h] })),
};

fs.writeFileSync(path.join(__dirname, "audit-report.json"), JSON.stringify(report, null, 2));
console.log("Total source files:", report.totalSourceFiles);
console.log("Unique source content:", report.uniqueSourceContent);
console.log("Already-existing site files:", report.totalExistingFiles);
console.log("Internal duplicates already on site:", internalDupes.length);
console.log("New unique pieces not yet on site:", report.newUniqueCount);
