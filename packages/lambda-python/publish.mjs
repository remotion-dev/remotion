import { execSync } from "node:child_process";

execSync(`python setup.py sdist bdist_wheel`, {
  stdio: "inherit",
});

execSync(
  `cat <<EOF > ~/.pypirc
[testpypi]
username = $PYPI_USERNAME
password = $PYPI_PASSWORD
EOF`,
  {
    stdio: "inherit",
  }
);
execSync(`python -m twine upload --repository testpypi dist/* `, {
  stdio: "inherit",
});

/**
 * Clean up after upload
 */
const rmComm = [
  `rm -rf build`,
  `rm -rf dist`,
  `rm -rf remotion_lambda_sdk.egg-info`,
];
execSync(rmComm.join(" && "), {
  stdio: "inherit",
});
