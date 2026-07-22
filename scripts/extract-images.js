// One-time migration: pull base64 data URIs out of about.html / portfolio.html
// into real files under img/uploads, and report what was found + where.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'img', 'uploads');
fs.mkdirSync(outDir, { recursive: true });

const targets = ['about.html', 'portfolio.html'];
const extFor = { jpeg: 'jpg', jpg: 'jpg', png: 'png', gif: 'gif', webp: 'webp' };

const report = [];

for (const file of targets) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const re = /data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=]+)/g;
  let match;
  let i = 0;
  const replacements = [];

  while ((match = re.exec(html)) !== null) {
    i++;
    const [full, type, data] = match;
    const ext = extFor[type] || 'jpg';

    // grab a little context before the match to help identify what this image is
    const start = Math.max(0, match.index - 300);
    const context = html.slice(start, match.index);
    const classMatch = context.match(/class="([^"]*)"[^>]*$/);
    const idMatch = context.match(/id="([^"]*)"[^>]*$/);
    const altMatch = context.match(/alt="([^"]*)"[^>]*$/);
    const label = (idMatch && idMatch[1]) || (altMatch && altMatch[1]) || (classMatch && classMatch[1]) || 'image';
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image';

    const basename = `${path.basename(file, '.html')}-${slug}-${i}.${ext}`;
    const outPath = path.join(outDir, basename);
    fs.writeFileSync(outPath, Buffer.from(data, 'base64'));

    replacements.push({ full, newPath: `/img/uploads/${basename}` });
    report.push({ file, index: i, context: label, bytes: data.length, savedAs: basename });
  }

  for (const r of replacements) {
    html = html.replace(r.full, r.newPath);
  }
  fs.writeFileSync(filePath, html, 'utf8');
}

fs.writeFileSync(path.join(__dirname, 'extract-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
