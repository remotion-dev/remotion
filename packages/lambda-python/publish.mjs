import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config();
const isTest = true;
const pypiRepo = isTest ? "testpypi" : "pypi";

/**
 * creates an environment file that is referenced by twine
 */
execSync(
  `cat <<EOF > ~/.pypirc
[${pypiRepo}]
username = ${process.env.PYPI_USERNAME}
password = ${process.env.PYPI_PASSWORD}
EOF`,
  {
    stdio: "inherit",
  }
);

const commands = [
  "python -m venv remotion-env",
  "source remotion-env/bin/activate",
  "pip install boto3 twine wheel",
  "python setup.py sdist bdist_wheel",
  `python -m twine upload --repository ${pypiRepo} dist/*`,
  "deactivate",
  "rm -rf remotion-env",
];

execSync(commands.join(" && "), {
  stdio: "inherit",
});

// clean up used folder
const rmComm = [`rm -rf build`, `rm -rf dist`, `rm -rf remotion_lambda.*`];
execSync(rmComm.join(" && "), {
  stdio: "inherit",
});

console.log("Remotion lambda published.");
