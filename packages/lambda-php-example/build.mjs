import { execSync } from "child_process";

const where = process.platform === "win32" ? "where" : "which";

const hasComposer = () => {
  try {
    execSync(`${where} composer`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

if (!hasComposer()) {
  console.log("Environment has no Composer. Skipping...");
  process.exit(0);
}
execSync("composer install --quiet", { stdio: "inherit" });
console.log("composer installed deps.");
