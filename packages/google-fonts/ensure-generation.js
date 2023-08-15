const fs = require("node:fs");

const filesCjs = fs.readdirSync("./dist/cjs");

if (filesCjs.length < 2200) {
  console.error("Not publishing, Google fonts have not been generated");
  process.exit(1);
}
const filesEsm = fs.readdirSync("./dist/esm");

if (filesEsm.length < 2200) {
  console.error("Not publishing, Google fonts have not been generated");
  process.exit(1);
}
