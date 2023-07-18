import { execSync } from "child_process";

const where = process.platform === "win32" ? "where" : "which";

const hasPython = () => {
  try {
    execSync(`${where} python`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

if (!hasPython()) {
  console.log("Environment has no Python. Skipping...");
  process.exit(0);
}
execSync("pylint ./remotion_lambda_sdk", { stdio: "inherit" });
console.log("Linted python lint!");
