// src/gcpInstaller/install.mts
import { execSync as execSync9 } from "child_process";

// src/gcpInstaller/installerScripts/components/colorCodes.mts
var resetText = "\x1B[0m";
var greenText = `${resetText}\x1B[32;1m`;
var blueText = `${resetText}\x1B[34;1m`;
var redText = `${resetText}\x1B[31;1m`;
var redBackground = `${resetText}\x1B[41;1m`;
var greenBackground = `${resetText}\x1B[42;1m`;
var blueBackground = `${resetText}\x1B[44;1m`;
var colorCode = {
  resetText,
  greenText,
  blueText,
  redText,
  redBackground,
  greenBackground,
  blueBackground
};

// src/gcpInstaller/installerScripts/components/projectIdPrompt.mts
import { execSync } from "child_process";
import readline from "readline";
function projectIdPrompt() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(
      `GCP Project ID is not set. What is the Project ID? ${colorCode.blueText}`,
      (answer) => {
        rl.write(`
${colorCode.resetText}`);
        rl.close();
        execSync(`gcloud config set project ${answer.trim()}`, {
          stdio: "inherit"
        });
        const projectID = execSync("gcloud config get-value project", {
          stdio: ["inherit", "pipe", "pipe"]
        }).toString().trim();
        if (!projectID) {
          console.log("Operation cancelled.");
          process.exit(1);
        }
        resolve(projectID);
      }
    );
  });
}

// src/gcpInstaller/installerScripts/components/splashScreen.mts
import { execSync as execSync2 } from "child_process";
function cloudRunSplashScreen() {
  execSync2(
    `echo "

${colorCode.greenBackground}                                                "`,
    {
      stdio: "inherit"
    }
  );
  execSync2('echo "    GCP project setup for Remotion Cloud Run    "', {
    stdio: "inherit"
  });
  execSync2(
    `echo "                                                

${colorCode.resetText}"`,
    { stdio: "inherit" }
  );
}

// src/gcpInstaller/installerScripts/components/taskPrompt.mts
import { execSync as execSync3 } from "child_process";
import readline2 from "readline";
function taskPrompt(projectID) {
  return new Promise((resolve) => {
    const rl = readline2.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(
      `What would you like to do?
[1] Cloud Run rendering in ${colorCode.blueText}${projectID}${colorCode.resetText} - Setup / Update Remotion version.
[2] ${colorCode.blueText}${projectID}${colorCode.resetText} is already set up for Remotion. Manage keys and/or generate a new .env file for the Remotion Service Account.
${colorCode.blueText}`,
      async (answer) => {
        rl.write(`
${colorCode.resetText}`);
        if (answer.trim() === "1") {
          rl.write(
            `${colorCode.blueText}<Terraform selected>

${colorCode.resetText}`
          );
          rl.close();
          return resolve("runTerraform");
        }
        if (answer.trim() === "2") {
          rl.write(
            `${colorCode.blueText}<key management selected>

${colorCode.resetText}`
          );
          rl.close();
          return resolve("generateEnv");
        }
        rl.close();
        execSync3(
          `echo "${colorCode.redText}Invalid selection. Please enter 1 or 2.
${colorCode.resetText}"`,
          {
            stdio: "inherit"
          }
        );
        const result = await taskPrompt(projectID);
        resolve(result);
      }
    );
  });
}

// src/gcpInstaller/installerScripts/tasks/generateEnv.mts
import { execSync as execSync5 } from "child_process";
import readline4 from "readline";

// src/gcpInstaller/installerScripts/components/checkEnvFile.mts
import { execSync as execSync4 } from "child_process";
import { existsSync } from "fs";
import readline3 from "readline";
function deleteEnvPrompt() {
  return new Promise((resolve) => {
    const rl = readline3.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(
      `
${colorCode.redText}.env file exists in this directory. Delete and create new .env file [yes, no]? ${colorCode.blueText}`,
      async (answer) => {
        rl.write(`
${colorCode.resetText}`);
        rl.close();
        if (["yes", "y"].indexOf(answer.trim().toLowerCase()) >= 0) {
          execSync4("rm .env");
          execSync4(
            `echo "${colorCode.redText}Deleted .env file.${colorCode.resetText}"`
          );
          return resolve(true);
        }
        if (["no", "n"].indexOf(answer.trim().toLowerCase()) >= 0) {
          execSync4('echo ".env file present, and not deleted, exiting..."', {
            stdio: "inherit"
          });
          process.exit(1);
        }
        console.log("Invalid response.\n");
        const result = await deleteEnvPrompt();
        resolve(result);
      }
    );
  });
}
async function checkEnvFile() {
  if (existsSync(".env")) {
    await deleteEnvPrompt();
  }
}

// src/gcpInstaller/installerScripts/tasks/generateEnv.mts
async function generateEnv(projectID) {
  const gloudSAKeyCmd = `gcloud iam service-accounts keys list --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com --format json | 
	jq -r '.[] | select(.keyType != "SYSTEM_MANAGED") | "\\(.name | split("/") | last) \\(.validAfterTime) \\(.validBeforeTime) \\(.keyOrigin)"'`;
  function countKeys() {
    const output = execSync5(gloudSAKeyCmd, {
      stdio: ["inherit", "pipe", "pipe"]
    }).toString().trim();
    const listOfKeys = output === "" ? [] : output.split("\n");
    const keyCount = listOfKeys.length;
    const pluralized = keyCount === 1 ? "key" : "keys";
    execSync5(`echo "
${keyCount} service account ${pluralized} currently"`, {
      stdio: "inherit"
    });
    return keyCount > 0;
  }
  function listKeys() {
    console.log("");
    execSync5(
      `{
				echo "KEY_ID CREATED_AT EXPIRES_AT KEY_ORIGIN"; 
				${gloudSAKeyCmd}
				} | column -t`,
      { stdio: "inherit" }
    );
  }
  function deleteKeyPrompt() {
    return new Promise((resolve) => {
      const rl = readline4.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(
        `
${colorCode.greenText}To delete one of these keys, type in the KEY_ID. Otherwise, press enter to continue. ${colorCode.blueText}`,
        async (answer) => {
          rl.write(`${colorCode.resetText}`);
          if (answer.trim() === "") {
            rl.write(
              `${colorCode.blueText}<enter pressed>
${colorCode.resetText}`
            );
            rl.close();
            return resolve(true);
          }
          rl.close();
          execSync5(
            `gcloud iam service-accounts keys delete ${answer.trim()} --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
            { stdio: "inherit" }
          );
          listKeys();
          const result = await deleteKeyPrompt();
          resolve(result);
        }
      );
    });
  }
  const existingKeys = countKeys();
  if (existingKeys) {
    execSync5(
      `echo "
There is a limit of 10 keys per Service Account in GCP (not including the one managed by GCP itself).
"`,
      {
        stdio: "inherit"
      }
    );
    execSync5(
      `echo "You should delete any of these keys that are no longer in use for ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText}:"`,
      {
        stdio: "inherit"
      }
    );
    listKeys();
    await deleteKeyPrompt();
  }
  await checkEnvFile();
  execSync5(`echo "
Generating new Service Account key...
"`, {
    stdio: "inherit"
  });
  try {
    execSync5(
      `gcloud iam service-accounts keys create key.json --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
      { stdio: "inherit" }
    );
  } catch (e) {
    execSync5(
      `echo "
${colorCode.redBackground}Creation of new key failed, check if you have more than 10 keys already.${colorCode.resetText}

"`,
      { stdio: "inherit" }
    );
    throw e;
  }
  execSync5(
    `echo "REMOTION_GCP_PRIVATE_KEY=$(jq '.private_key' key.json)" >> .env && echo "REMOTION_GCP_CLIENT_EMAIL=$(jq '.client_email' key.json)" >> .env && echo "REMOTION_GCP_PROJECT_ID=${projectID}" >> .env`,
    { stdio: "inherit" }
  );
  execSync5("rm key.json", { stdio: "inherit" });
  execSync5(
    `echo "
${colorCode.greenText}key.json has been deleted from this virtual machine.${colorCode.resetText}"`,
    { stdio: "inherit" }
  );
  execSync5(
    `echo "
${colorCode.redText}To delete .env from this virtual machine after downloading, run${colorCode.resetText} rm .env"`,
    { stdio: "inherit" }
  );
  console.log(
    `
${colorCode.blueBackground}        .env file is ready for download.        ${colorCode.resetText}`
  );
}

// src/gcpInstaller/installerScripts/tasks/setupGcpProject.mts
import { execSync as execSync8 } from "child_process";

// src/gcpInstaller/installerScripts/components/checkTerraformStateFile.mts
import { execSync as execSync6 } from "child_process";
import { existsSync as existsSync2, readFileSync } from "fs";
function checkTerraformStateFile(projectID) {
  if (existsSync2("terraform.tfstate")) {
    execSync6(
      'echo "Terraform State file exists. Checking it is for the current Remotion project...\n"',
      { stdio: "inherit" }
    );
    const tfstate = JSON.parse(readFileSync("terraform.tfstate", "utf-8"));
    const tfstateProject = tfstate.outputs?.remotion_project_id?.value;
    const deleteTfFilesString = `Change directory, or delete all existing terraform files within the current directory, before trying again.
To delete all terraform files, run: ${colorCode.resetText}rm -rf .terraform terraform.tfstate terraform.tfstate.backup .terraform.lock.hcl terraform.tfstate.*.backup${colorCode.resetText}`;
    if (tfstateProject === void 0) {
      execSync6(
        `echo "${colorCode.redText}Terraform state file is not from a Remotion project.
${deleteTfFilesString}"`,
        { stdio: "inherit" }
      );
      process.exit(1);
    }
    if (tfstateProject === projectID) {
      execSync6(
        `echo "${colorCode.greenText}Terraform state file is for the current Remotion project - ${projectID}. Continuing...${colorCode.resetText}
"`,
        { stdio: "inherit" }
      );
    } else {
      execSync6(
        `echo "${colorCode.redText}Terraform state file is for project ${colorCode.redBackground}${tfstateProject}${colorCode.redText}.
The current project is ${colorCode.redBackground}${projectID}${colorCode.redText}.
${deleteTfFilesString}"`,
        { stdio: "inherit" }
      );
      process.exit(1);
    }
  }
}

// src/gcpInstaller/installerScripts/components/generateEnvPrompt.mts
import readline5 from "readline";
function generateEnvPrompt() {
  return new Promise((resolve) => {
    const rl = readline5.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(
      `
${colorCode.greenText}Do you want to generate the .env file for your code base? ${colorCode.blueText}`,
      async (answer) => {
        rl.write(`${colorCode.resetText}`);
        rl.close();
        if (["yes", "y"].indexOf(answer.trim().toLowerCase()) >= 0)
          return resolve(true);
        if (["no", "n"].indexOf(answer.trim().toLowerCase()) >= 0)
          return resolve(false);
        console.log("Invalid response.");
        const result = await generateEnvPrompt();
        resolve(result);
      }
    );
  });
}

// src/gcpInstaller/installerScripts/components/terraformApplyPrompt.mts
import readline6 from "readline";
function terraformApplyPrompt() {
  return new Promise((resolve) => {
    const rl = readline6.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(
      `
${colorCode.greenText}Do you want to apply the above plan? ${colorCode.blueText}`,
      async (answer) => {
        rl.write(colorCode.resetText);
        rl.close();
        if (["yes", "y"].indexOf(answer.trim().toLowerCase()) >= 0)
          return resolve(true);
        if (["no", "n"].indexOf(answer.trim().toLowerCase()) >= 0)
          return resolve(false);
        console.log("Invalid response.");
        const result = await terraformApplyPrompt();
        resolve(result);
      }
    );
  });
}

// src/gcpInstaller/installerScripts/components/tfSuccessScreen.mts
import { execSync as execSync7 } from "child_process";
function tfSuccessScreen() {
  execSync7(
    `echo "

${colorCode.blueBackground}                                                "`,
    {
      stdio: "inherit"
    }
  );
  execSync7('echo "        Terraform completed successfully        "', {
    stdio: "inherit"
  });
  execSync7(
    `echo "                                                ${colorCode.resetText}

"`,
    { stdio: "inherit" }
  );
}

// src/gcpInstaller/installerScripts/tasks/setupGcpProject.mts
async function setupGcpProject(projectID) {
  checkTerraformStateFile(projectID);
  execSync8('echo "Checking if Remotion Service Account already exists..."', {
    stdio: "inherit"
  });
  const serviceAccountExists = execSync8(
    `gcloud iam service-accounts list --filter="email:remotion-sa@${projectID}.iam.gserviceaccount.com" --project=${projectID}`,
    {
      stdio: ["inherit", "pipe", "pipe"]
    }
  ).toString().trim().length > 0;
  if (serviceAccountExists) {
    execSync8(
      `echo "${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} found, and does not need to be created.
"`,
      {
        stdio: "inherit"
      }
    );
  } else {
    execSync8(
      `echo "No service account found, ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} will be created.
"`,
      {
        stdio: "inherit"
      }
    );
  }
  execSync8('echo "Checking if Remotion IAM Role already exists..."', {
    stdio: "inherit"
  });
  let iamRoleExists = false;
  try {
    execSync8(`gcloud iam roles describe RemotionSA --project=${projectID}`, {
      stdio: ["inherit", "pipe", "pipe"]
    }).toString().trim();
    iamRoleExists = true;
    execSync8(
      `echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role found, and does not need to be created.
"`,
      {
        stdio: "inherit"
      }
    );
  } catch {
    iamRoleExists = false;
    execSync8(
      `echo "Role not found, ${colorCode.blueText}RemotionSA${colorCode.resetText} will be created.
"`,
      {
        stdio: "inherit"
      }
    );
  }
  let iamRoleAttached = false;
  if (serviceAccountExists && iamRoleExists) {
    execSync8(
      'echo "Checking if Remotion IAM Role is already attached to Remotion Service Account"',
      {
        stdio: "inherit"
      }
    );
    iamRoleAttached = serviceAccountExists && Boolean(
      execSync8(
        `gcloud projects get-iam-policy ${projectID} --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:remotion-sa@${projectID}.iam.gserviceaccount.com"`,
        {
          stdio: ["inherit", "pipe", "pipe"]
        }
      ).toString().trim().split("\n").find((role) => {
        return role === `projects/${projectID}/roles/RemotionSA`;
      })
    );
    if (iamRoleAttached) {
      execSync8(
        `echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role already attached to ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} found, and does not need to be re-attached.
"`,
        {
          stdio: "inherit"
        }
      );
    } else {
      execSync8(
        `echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role not attached to ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText}, and will be attached now.
"`,
        {
          stdio: "inherit"
        }
      );
    }
  }
  execSync8(
    'echo "Checking if Cloud Resource Manager and Cloud Run APIs are enabled..."',
    {
      stdio: "inherit"
    }
  );
  const listOfServices = execSync8(
    `gcloud services list --project=${projectID}`,
    {
      stdio: ["inherit", "pipe", "pipe"]
    }
  ).toString().trim().split("\n");
  const resourceManagerEnabled = Boolean(
    listOfServices.find((api) => {
      return api.startsWith("cloudresourcemanager.googleapis.com");
    })
  );
  if (resourceManagerEnabled) {
    execSync8(
      `echo "${colorCode.blueText}cloudresourcemanager.googleapis.com${colorCode.resetText} API already enabled on project."`,
      {
        stdio: "inherit"
      }
    );
  } else {
    execSync8(
      `echo "${colorCode.blueText}cloudresourcemanager.googleapis.com${colorCode.resetText} API not enabled on project, and will be enabled now."`,
      {
        stdio: "inherit"
      }
    );
  }
  const cloudRunEnabled = Boolean(
    listOfServices.find((api) => {
      return api.startsWith("run.googleapis.com");
    })
  );
  if (cloudRunEnabled) {
    execSync8(
      `echo "${colorCode.blueText}run.googleapis.com${colorCode.resetText} API already enabled on project.
"`,
      {
        stdio: "inherit"
      }
    );
  } else {
    execSync8(
      `echo "${colorCode.blueText}run.googleapis.com${colorCode.resetText} API not enabled on project, and will be enabled now.
"`,
      {
        stdio: "inherit"
      }
    );
  }
  console.log(
    `

${colorCode.greenBackground}                Running Terraform               ${colorCode.resetText}`
  );
  const terraformVariables = `-var="project_id=${projectID}"`;
  execSync8("terraform init", { stdio: "inherit" });
  if (serviceAccountExists) {
    execSync8(
      `echo "Attempting to import current state from GCP of ${colorCode.blueText}Remotion Service Account${colorCode.resetText}."`,
      {
        stdio: "inherit"
      }
    );
    try {
      execSync8("terraform state list google_service_account.remotion_sa", {
        stdio: "pipe"
      });
    } catch {
      execSync8(
        `terraform import ${terraformVariables} google_service_account.remotion_sa projects/${projectID}/serviceAccounts/remotion-sa@${projectID}.iam.gserviceaccount.com`,
        { stdio: "inherit" }
      );
    }
  }
  if (iamRoleExists) {
    execSync8(
      `echo "Attempting to import current state from GCP of ${colorCode.blueText}Remotion IAM role${colorCode.resetText}."`,
      {
        stdio: "inherit"
      }
    );
    try {
      execSync8(
        "terraform state list google_project_iam_custom_role.remotion_sa",
        {
          stdio: "pipe"
        }
      );
    } catch {
      execSync8(
        `terraform import ${terraformVariables} google_project_iam_custom_role.remotion_sa projects/${projectID}/roles/RemotionSA`,
        { stdio: "inherit" }
      );
    }
  }
  if (iamRoleAttached) {
    execSync8(
      `echo "Attempting to import current state from GCP of ${colorCode.blueText}Remotion IAM role <-> Remotion Service Account${colorCode.resetText}."`,
      {
        stdio: "inherit"
      }
    );
    try {
      execSync8("terraform state list google_project_iam_member.remotion_sa", {
        stdio: "pipe"
      });
    } catch {
      execSync8(
        `terraform import ${terraformVariables} google_project_iam_member.remotion_sa "${projectID} projects/${projectID}/roles/RemotionSA serviceAccount:remotion-sa@${projectID}.iam.gserviceaccount.com"`,
        { stdio: "inherit" }
      );
    }
  }
  if (resourceManagerEnabled) {
    execSync8(
      `echo "Attempting to import current state from GCP of ${colorCode.blueText}Cloud Resource Manager API${colorCode.resetText}."`,
      {
        stdio: "inherit"
      }
    );
    try {
      execSync8(
        "terraform state list google_project_service.cloud_resource_manager",
        {
          stdio: "pipe"
        }
      );
    } catch {
      execSync8(
        `terraform import ${terraformVariables} google_project_service.cloud_resource_manager ${projectID}/cloudresourcemanager.googleapis.com`,
        { stdio: "inherit" }
      );
    }
  }
  if (cloudRunEnabled) {
    execSync8(
      `echo "Attempting to import current state from GCP of ${colorCode.blueText}Cloud Run API${colorCode.resetText}."`,
      {
        stdio: "inherit"
      }
    );
    try {
      execSync8("terraform state list google_project_service.cloud_run", {
        stdio: "pipe"
      });
    } catch {
      execSync8(
        `terraform import ${terraformVariables} google_project_service.cloud_run ${projectID}/run.googleapis.com`,
        { stdio: "inherit" }
      );
    }
  }
  execSync8(`terraform plan ${terraformVariables} -out=remotion.tfplan`, {
    stdio: "inherit"
  });
  const applyPlan = await terraformApplyPrompt();
  if (applyPlan) {
    execSync8("terraform apply remotion.tfplan", { stdio: "inherit" });
    tfSuccessScreen();
    const generateEnvFile = await generateEnvPrompt();
    if (generateEnvFile) {
      await generateEnv(projectID);
    } else {
      console.log("No .env file generated.");
    }
  } else {
    console.log(
      `
${colorCode.blueBackground}       Plan not applied, no changes made.       ${colorCode.resetText}`
    );
    const generateEnvFile = await generateEnvPrompt();
    if (generateEnvFile) {
      await generateEnv(projectID);
    } else {
      console.log(
        `
${colorCode.blueBackground}             No .env file generated             ${colorCode.resetText}`
      );
    }
  }
}

// src/gcpInstaller/install.mts
cloudRunSplashScreen();
var start = async () => {
  execSync9(`echo "Retrieving current Project ID..."`, {
    stdio: "inherit"
  });
  const projectID = execSync9("gcloud config get-value project", {
    stdio: ["inherit", "pipe", "pipe"]
  }).toString().trim() || await projectIdPrompt();
  execSync9(
    `echo "Project set to ${colorCode.blueText}${projectID}${colorCode.resetText}
"`,
    {
      stdio: "inherit"
    }
  );
  const selection = await taskPrompt(projectID);
  switch (selection) {
    case "runTerraform":
      await setupGcpProject(projectID);
      break;
    case "generateEnv":
      await generateEnv(projectID);
      break;
    default:
      break;
  }
};
start();
