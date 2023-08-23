import {execSync} from 'child_process';
import {existsSync, readFileSync} from 'fs';
import {colorCode} from './colorCodes.mjs';

export function checkTerraformStateFile(projectID: string) {
	/****************************************
	 * Check for existing Terraform State
	 ****************************************/

	if (existsSync('terraform.tfstate')) {
		execSync(
			'echo "Terraform State file exists. Checking it is for the current Remotion project...\n"',
			{stdio: 'inherit'},
		);

		const tfstate = JSON.parse(readFileSync('terraform.tfstate', 'utf-8'));

		const tfstateProject = tfstate.outputs?.remotion_project_id?.value;

		const deleteTfFilesString = `Change directory, or delete all existing terraform files within the current directory, before trying again.\nTo delete all terraform files, run: ${colorCode.resetText}rm -rf .terraform terraform.tfstate terraform.tfstate.backup .terraform.lock.hcl terraform.tfstate.*.backup${colorCode.resetText}`;

		if (tfstateProject === undefined) {
			execSync(
				`echo "${colorCode.redText}Terraform state file is not from a Remotion project.\n${deleteTfFilesString}"`,
				{stdio: 'inherit'},
			);
			process.exit(1);
		}

		if (tfstateProject === projectID) {
			execSync(
				`echo "${colorCode.greenText}Terraform state file is for the current Remotion project - ${projectID}. Continuing...${colorCode.resetText}\n"`,
				{stdio: 'inherit'},
			);
		} else {
			execSync(
				`echo "${colorCode.redText}Terraform state file is for project ${colorCode.redBackground}${tfstateProject}${colorCode.redText}.\nThe current project is ${colorCode.redBackground}${projectID}${colorCode.redText}.\n${deleteTfFilesString}"`,
				{stdio: 'inherit'},
			);
			process.exit(1);
		}
	}
}
