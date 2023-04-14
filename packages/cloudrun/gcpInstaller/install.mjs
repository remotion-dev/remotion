import { execSync } from "child_process";
// Components
import { colorCode } from "./components/colorCodes.mjs";
import { cloudRunSplashScreen } from "./components/splashScreen.mjs";
import { taskPrompt } from "./components/taskPrompt.mjs";
// Tasks
import { generateEnv } from "./tasks/generateEnv.mjs";
import { updateRemotion } from "./tasks/updateRemotion.mjs";
import { setupGcpProject } from "./tasks/setupGcpProject.mjs";

/****************************************
 * Splash screen for Remotion Cloud Run
 ****************************************/
cloudRunSplashScreen();

/****************************************
 * Set project ID for Terraform and gcloud commands
 ****************************************/
execSync(`echo "Retrieving current Project ID..."`, {
  stdio: "inherit",
});

const projectID = execSync("gcloud config get-value project", {
  stdio: ["inherit", "pipe", "pipe"],
})
  .toString()
  .trim();

execSync(
  `echo "Project set to ${colorCode.blueText}${projectID}${colorCode.resetText}\n"`,
  {
    stdio: "inherit",
  }
);

/****************************************
 * Check task the user is trying to complete
 ****************************************/
const selection = await taskPrompt(projectID);

switch (selection) {
  case "runTerraform":
    await setupGcpProject(projectID);
    break;

  case "updateRemotion":
    await updateRemotion(projectID);
    break;

  case "generateEnv":
    await generateEnv(projectID);
    break;

  default:
    break;
}
