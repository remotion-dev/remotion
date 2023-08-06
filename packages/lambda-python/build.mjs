import { execSync } from "child_process";

const where = process.platform === "win32" ? "where" : "which";

const hasPython = () => {
  try {
    execSync(`${where} python`);
    return true;
  } catch (err) {
    return false;
  }
};

if (!hasPython()) {
  console.log("Environment has no Python. Skipping...");
  process.exit(0);
}

const commands = [
  "python -m venv remotion-env-lint",
  ". ./remotion-env-lint/bin/activate",
  "pip install boto3 pylint",
  "pylint ./remotion_lambda",
  "deactivate",
  "rm -rf remotion-env-lint",
];

execSync(commands.join(" && "), {
  stdio: "inherit",
});

console.log("Linted python lint!");
