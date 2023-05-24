import { execSync } from "child_process";

const where = process.platform === "win32" ? "where" : "which";

const hasComposer = () => {
  try {
    execSync(`${where} php`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

if (!hasComposer()) {
  if (process.env.CI) {
    console.log("CI Environment has no Composer.");
    process.exit(1);
  }
  console.log("Environment has no Composer. Skipping...");
  process.exit(0);
}
execSync("php composer.phar install", { stdio: "inherit" });
console.log("composer installed deps.");
