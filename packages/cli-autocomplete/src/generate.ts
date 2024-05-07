// eslint-disable-next-line @withfig/fig-linter/no-missing-default-export
import { execSync } from "child_process";
import completionSpec from "./source";
import { writeFileSync } from "fs";

const stringified = JSON.stringify(completionSpec, null, 2);
const output = `const completionSpec: Fig.Spec = ${stringified}; export default completionSpec;`;

writeFileSync("src/generatedCompletionSpec.ts", output);

execSync("bun x prettier --write src/generatedCompletionSpec.ts");
execSync("bun x eslint --fix src/generatedCompletionSpec.ts", {
  stdio: "inherit",
});
