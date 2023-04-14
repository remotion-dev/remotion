import { execSync } from "child_process";
import readline from "readline";
import { colorCode } from "./colorCodes.mjs";

export function taskPrompt(projectID) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `What would you like to do?\n[1] Setup the GCP project ${projectID} as a Remotion Cloud Run environment.\n[2] ${projectID} is already set up for Remotion, update to a newer Remotion version.\n[3] ${projectID} is already set up for Remotion, generate a new .env file or manage keys for the Remotion Service Account.\n${colorCode.blueText}`,
      async (answer) => {
        // reset terminal color
        rl.output.write(`\n${colorCode.resetText}`);

        if (answer.trim() === "1") {
          rl.output.write(
            `${colorCode.blueText}<Terraform selected>\n\n${colorCode.resetText}`
          );
          rl.close();
          return resolve("runTerraform");
        }

        if (answer.trim() === "2") {
          rl.output.write(
            `${colorCode.blueText}<Update Remotion selected>\n\n${colorCode.resetText}`
          );
          rl.close();
          return resolve("updateRemotion");
        }

        if (answer.trim() === "3") {
          rl.output.write(
            `${colorCode.blueText}<.env creation selected>\n\n${colorCode.resetText}`
          );
          rl.close();
          return resolve("generateEnv");
        }

        rl.close();
        execSync(
          `echo "${colorCode.redText}Invalid selection. Please enter 1, 2 or 3.\n${colorCode.resetText}"`,
          {
            stdio: "inherit",
          }
        );

        const result = await taskPrompt();

        resolve(result);
      }
    );
  });
}
