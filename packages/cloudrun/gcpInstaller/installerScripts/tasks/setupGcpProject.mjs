import { execSync } from "child_process";
// Components
import { colorCode } from "../components/colorCodes.mjs";
import { remotionVersionPrompt } from "../components/remotionVersionPrompt.mjs";
import { checkTerraformStateFile } from "../components/checkTerraformStateFile.mjs";
import { generateEnvPrompt } from "../components/generateEnvPrompt.mjs";
import { terraformApplyPrompt } from "../components/terraformApplyPrompt.mjs";
// Tasks
import { generateEnv } from "./generateEnv.mjs";

export async function setupGcpProject(projectID) {
  checkTerraformStateFile(projectID);
  /****************************************
   * Prompt user for Remotion version
   ****************************************/
  const remotionVersion = await remotionVersionPrompt();

  /****************************************
   * Check if Remotion Service Account already exists
   ****************************************/
  execSync('echo "Checking if Remotion Service Account already exists..."', {
    stdio: "inherit",
  });

  const serviceAccountExists =
    execSync(
      `gcloud iam service-accounts list --filter="email:remotion-sa@${projectID}.iam.gserviceaccount.com" --project=${projectID}`,
      {
        stdio: ["inherit", "pipe", "pipe"],
      }
    )
      .toString()
      .trim().length > 0;

  if (serviceAccountExists) {
    execSync(
      `echo "${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} found, and does not need to be created.\n"`,
      {
        stdio: "inherit",
      }
    );
  } else {
    execSync(
      `echo "No service account found, ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} will be created.\n"`,
      {
        stdio: "inherit",
      }
    );
  }

  /****************************************
   * Check if Remotion IAM Role already exists
   ****************************************/
  execSync('echo "Checking if Remotion IAM Role already exists..."', {
    stdio: "inherit",
  });

  let iamRoleExists = false;
  try {
    execSync(`gcloud iam roles describe RemotionSA --project=${projectID}`, {
      stdio: ["inherit", "pipe", "pipe"],
    })
      .toString()
      .trim();
    iamRoleExists = true;
    execSync(
      `echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role found, and does not need to be created.\n"`,
      {
        stdio: "inherit",
      }
    );
  } catch {
    iamRoleExists = false;
    execSync(
      `echo "Role not found, ${colorCode.blueText}RemotionSA${colorCode.resetText} will be created.\n"`,
      {
        stdio: "inherit",
      }
    );
  }

  /****************************************
   * Terraform init, plan and apply. Will prompt user for confirmation before applying.
   ****************************************/

  console.log(
    `\n\n${colorCode.greenBackground}                Running Terraform               ${colorCode.resetText}`
  );
  const terraformVariables = `-var="remotion_version=${remotionVersion}" -var="project_id=${projectID}" -var="service_account_exists=${serviceAccountExists}"`;

  execSync("terraform init", { stdio: "inherit" });

  if (iamRoleExists) {
    // If the role already exists, import the resource so that the permissions can be updated in place

    // If tfstate file exists, remove the role resource from state so that it can be imported fresh
    try {
      execSync("terraform state list", { stdio: "pipe" });
      execSync(
        `terraform state rm google_project_iam_custom_role.remotion_sa`,
        {
          stdio: "inherit",
        }
      );
    } catch {}

    execSync(
      `terraform import ${terraformVariables} google_project_iam_custom_role.remotion_sa projects/${projectID}/roles/RemotionSA`,
      { stdio: "inherit" }
    );
  }

  execSync(`terraform plan ${terraformVariables} -out=remotion.tfplan`, {
    stdio: "inherit",
  });

  // After the plan is complete, prompt the user to apply the plan or not
  const applyPlan = await terraformApplyPrompt();

  if (applyPlan) {
    execSync("terraform apply remotion.tfplan", { stdio: "inherit" });
    // After the resources are created, prompt the user to generate the .env file or not
    const generateEnvFile = await generateEnvPrompt();
    if (generateEnvFile) {
      await generateEnv(projectID);
    } else {
      console.log("No .env file generated.");
    }
  } else {
    console.log("Plan not applied, no changes made.");
    const generateEnvFile = await generateEnvPrompt();
    if (generateEnvFile) {
      await generateEnv(projectID);
    } else {
      console.log("No .env file generated.");
    }
  }
}
