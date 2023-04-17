import { execSync } from "child_process";
// Components
import { colorCode } from "../components/colorCodes.mjs";
import { remotionVersionPrompt } from "../components/remotionVersionPrompt.mjs";
import { terraformApplyPrompt } from "../components/terraformApplyPrompt.mjs";
import { checkTerraformStateFile } from "../components/checkTerraformStateFile.mjs";

export async function updateRemotion(projectID) {
  checkTerraformStateFile(projectID);

  /****************************************
   * Check the existing remotion version
   ****************************************/

  const deployedVersion = execSync(
    `gcloud iam service-accounts describe remotion-sa@${projectID}.iam.gserviceaccount.com | grep "description:" | awk '{print $2}'`,
    {
      stdio: ["inherit", "pipe", "pipe"],
    }
  )
    .toString()
    .trim();

  execSync(
    `echo "For project ${colorCode.blueText}${projectID}${colorCode.resetText}, Remotion version ${colorCode.blueText}${deployedVersion}${colorCode.resetText} is deployed.\n"`,
    {
      stdio: "inherit",
    }
  );

  const remotionVersion = await remotionVersionPrompt();

  /****************************************
   * Terraform init, plan and apply. Will prompt user for confirmation before applying.
   ****************************************/

  console.log(
    `\n\n${colorCode.greenBackground}                Running Terraform               ${colorCode.resetText}`
  );
  const terraformVariables = `-var="remotion_version=${remotionVersion}" -var="project_id=${projectID}" -var="service_account_exists=${true}"`;

  execSync("terraform init", { stdio: "inherit" });

  // If tfstate file exists, remove the role resource from state so that it can be imported fresh
  try {
    execSync("terraform state list", { stdio: "pipe" });
    execSync(`terraform state rm google_project_iam_custom_role.remotion_sa`, {
      stdio: "inherit",
    });
  } catch {}

  execSync(
    `terraform import ${terraformVariables} google_project_iam_custom_role.remotion_sa projects/${projectID}/roles/RemotionSA`,
    { stdio: "inherit" }
  );

  execSync(
    `terraform import ${terraformVariables} google_service_account.remotion_sa projects/${projectID}/serviceAccounts/remotion-sa@${projectID}.iam.gserviceaccount.com`,
    { stdio: "inherit" }
  );

  execSync(`terraform plan ${terraformVariables} -out=remotion.tfplan`, {
    stdio: "inherit",
  });

  // After the plan is complete, prompt the user to apply the plan or not
  const applyPlan = await terraformApplyPrompt();

  if (applyPlan) {
    execSync("terraform apply remotion.tfplan", { stdio: "inherit" });
  } else {
    console.log(
      "Plan not applied, deployed Remotion version remains unchanged."
    );
  }
}
