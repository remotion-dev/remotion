import { execSync } from "child_process";

const where = process.platform === "win32" ? "where" : "which";

const hasGo = () => {
  try {
    execSync(`${where} go`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

if (!hasGo()) {
  console.log("Environment has no Go. Skipping...");
  process.exit(0);
}
execSync("go mod tidy", { stdio: "inherit" });
console.log("Linted lambda-go!");
