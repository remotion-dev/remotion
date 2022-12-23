const fs = require("node:fs");

const files = fs.readdirSync(".");

if (files.length < 2200) {
  console.error("Not publishing, Google fonts have not been generated");
  process.exit(1);
}
