const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "..", "Portfolio Images", "Art - From Google Photos", "Illustration");
const outDir = path.join(__dirname, "..", "img", "uploads");
const galleryPath = path.join(__dirname, "..", "content", "gallery.json");

const items = [
  { file: "20240708_132040.jpg", title: "Lakeside", outName: "gallery-illustration-30.jpg" },
  { file: "Illustration7.png", title: "Puppy Love", outName: "gallery-illustration-31.png" },
  { file: "Illustration32.png", title: "Kiss", outName: "gallery-illustration-32.png" },
  { file: "Illustration33.png", title: "Rollout", outName: "gallery-illustration-33.png" },
  { file: "IMG_0922.jpeg", title: "Man with Cat", outName: "gallery-illustration-34.jpg" },
  { file: "IMG_1116.jpeg", title: "Cosmic Portrait (I)", outName: "gallery-illustration-35.jpg" },
  { file: "IMG_1121.jpeg", title: "Cosmic Portrait (II)", outName: "gallery-illustration-36.jpg" },
  { file: "IMG_20220420_175827_115.jpg", title: "Stove", outName: "gallery-illustration-37.jpg" },
  { file: "IMG_4605.PNG", title: "Paper Moon", outName: "gallery-illustration-38.png" },
  { file: "korradigital.jpg", title: "Korra (Digital Portrait)", outName: "gallery-illustration-39.jpg" },
];

const data = JSON.parse(fs.readFileSync(galleryPath, "utf8"));

for (const item of items) {
  fs.copyFileSync(path.join(srcDir, item.file), path.join(outDir, item.outName));
  data.items.push({
    title: item.title,
    image: `/img/uploads/${item.outName}`,
    tag: "Illustration",
    color: "glow2",
    digital: true,
  });
}

fs.writeFileSync(galleryPath, JSON.stringify(data, null, 2) + "\n");
console.log("Imported", items.length, "new Illustration pieces. Total gallery items now:", data.items.length);
