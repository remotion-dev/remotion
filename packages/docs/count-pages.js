const fs = require("fs");
const path = require("path");

const root = path.join(process.cwd(), "docs");

const pages = [];

const readDir = (dir) => {
  const docs = fs.readdirSync(dir);
  for (const doc of docs) {
    const stat = fs.statSync(path.join(dir, doc));
    if (stat.isDirectory()) {
      readDir(path.join(dir, doc));
    } else if (stat.isFile()) {
      if (doc.includes("redirect")) {
        continue;
      }

      pages.push(path.join(dir, doc));
    }
  }
};

readDir(root);

console.log(`There are ${pages.length} documentation pages.`);
