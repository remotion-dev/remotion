const fs = require("node:fs");

const files = fs.readdirSync(".");

if (files.length < 1000) {
  console.error("Not publishing, Google fonts have not been generated");
  process.exit(1);
}
