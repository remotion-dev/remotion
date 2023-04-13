// this will be executed with node
import {execSync} from 'child_process';
import readline from 'readline';

/****************************************
 * Text colours codes
 ****************************************/
const resetTextColor = '\u001b[0m';
const greenTextColor = `${resetTextColor}\u001b[32;1m`;
const blueTextColor = `${resetTextColor}\u001b[34;1m`;
const redTextColor = `${resetTextColor}\u001b[31;1m`;
const redBackground = `${resetTextColor}\u001b[41;1m`;
const greenBackground = `${resetTextColor}\u001b[42;1m`;

/****************************************
 * Splash screen for Remotion Cloud Run
 ****************************************/
execSync(
	`echo "\n\n${greenBackground}                                                "`,
	{
		stdio: 'inherit',
	}
);
execSync('echo "    GCP project setup for Remotion Cloud Run    "', {
	stdio: 'inherit',
});
execSync(
	`echo "                                                \n\n${resetTextColor}"`,
	{stdio: 'inherit'}
);

/****************************************
 * Set project ID for Terraform and gcloud commands
 ****************************************/
execSync(`echo "Retrieving current Project ID..."`, {
	stdio: 'inherit',
});

const projectID = execSync('gcloud config get-value project', {
	stdio: ['inherit', 'pipe', 'pipe'],
})
	.toString()
	.trim();

execSync(
	`echo "Project set to ${blueTextColor}${projectID}${resetTextColor}\n"`,
	{
		stdio: 'inherit',
	}
);

/****************************************
 * Check if user is configuring GCP Project, or just needs to generate .env file
 ****************************************/
function taskPrompt() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			`What would you like to do?\n[1] Setup the GCP project ${projectID} as a Remotion Cloud Run environment.\n[2] ${projectID} is already set up for Remotion, update to a newer Remotion version.\n[3] ${projectID} is already set up for Remotion, generate a new .env file or manage keys for the Remotion Service Account.\n${blueTextColor}`,
			async (answer) => {
				// reset terminal color
				rl.output.write(`\n${resetTextColor}`);

				if (answer.trim() === '1') {
					rl.output.write(
						`${blueTextColor}<Terraform selected>\n\n${resetTextColor}`
					);
					rl.close();
					return resolve('runTerraform');
				}

				if (answer.trim() === '2') {
					rl.output.write(
						`${blueTextColor}<Update Remotion selected>\n\n${resetTextColor}`
					);
					rl.close();
					return resolve('updateRemotion');
				}

				if (answer.trim() === '3') {
					rl.output.write(
						`${blueTextColor}<.env creation selected>\n\n${resetTextColor}`
					);
					rl.close();
					return resolve('generateEnv');
				}

				rl.close();
				execSync(
					`echo "${redTextColor}Invalid selection. Please enter 1, 2 or 3.\n${resetTextColor}"`,
					{
						stdio: 'inherit',
					}
				);

				const result = await taskPrompt();

				resolve(result);
			}
		);
	});
}

const selection = await taskPrompt();

switch (selection) {
	case 'runTerraform':
		await runTerraform();
		break;

	case 'updateRemotion':
		await updateRemotion();
		break;

	case 'generateEnv':
		await generateEnv();
		break;

	default:
		break;
}

function envPrompt() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			`\n${greenTextColor}Do you want to generate the .env file for your code base? ${blueTextColor}`,
			async (answer) => {
				// reset terminal color
				rl.output.write(`${resetTextColor}`);
				rl.close();

				if (['yes', 'y'].indexOf(answer.trim().toLowerCase()) >= 0)
					return resolve(true);

				if (['no', 'n'].indexOf(answer.trim().toLowerCase()) >= 0)
					return resolve(false);

				console.log('Invalid response.');
				const result = await envPrompt();

				resolve(result);
			}
		);
	});
}

function checkTerraformStateFile() {
	/****************************************
	 * Check for existing Terraform State
	 ****************************************/

	const dirFiles = execSync('ls -a', {
		stdio: ['inherit', 'pipe', 'pipe'],
	})
		.toString()
		.trim();

	if (dirFiles.includes('.tfstate') && !dirFiles.includes('.tfstate.backup')) {
		execSync(
			'echo "Terraform State file exists. Checking it is for the current Remotion project...\n"',
			{stdio: 'inherit'}
		);

		const tfstate = JSON.parse(
			execSync('cat terraform.tfstate', {
				stdio: ['inherit', 'pipe', 'pipe'],
			}).toString()
		);

		const tfstateProject = tfstate.outputs?.remotion_project_id?.value;

		if (tfstateProject === undefined) {
			execSync(
				`echo "${redTextColor}Terraform state file is not from a Remotion project.\nChange directory, or delete all existing terraform files within the current directory, before trying again.\nTo delete all terraform files, run: ${resetTextColor}rm -rf .terraform terraform.tfstate terraform.tfstate.backup .terraform.lock.hcl"`,
				{stdio: 'inherit'}
			);
			process.exit(1);
		}

		if (tfstateProject === projectID) {
			execSync(
				`echo "${greenTextColor}Terraform state file is for the current Remotion project - ${projectID}. Continuing...${resetTextColor}\n"`,
				{stdio: 'inherit'}
			);
		} else {
			execSync(
				`echo "${redTextColor}Terraform state file is for project ${redBackground}${tfstateProject}${redTextColor}.\nThe current project is ${redBackground}${projectID}${redTextColor}.\nChange directory, or delete all existing terraform files within the current directory, before trying again.${resetTextColor}"`,
				{stdio: 'inherit'}
			);
			process.exit(1);
		}
	}
}

function versionPrompt() {
	return new Promise((resolve) => {
		// regex to ensure remotionVersion is in semver format
		const semverRegex = new RegExp(
			/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
			'i'
		);

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			`What version of Remotion do you want to use (format: 1.0.0)? ${blueTextColor}`,
			async (answer) => {
				rl.write(`\n${resetTextColor}`);
				rl.close();

				let fileError = false;
				if (semverRegex.test(answer.trim())) {
					try {
						execSync(
							`gcloud storage ls gs://remotion-sa/${answer.trim()}/sa-permissions.json`,
							{stdio: 'inherit'}
						);
						return resolve(answer.trim());
					} catch {
						fileError = true;
					}
				}

				if (fileError) {
					console.log(
						`${redTextColor}Cannot find permissions file that matches version ${answer.trim()}.\n${resetTextColor}`
					);
				} else {
					console.log(
						`${redTextColor}${answer.trim()} is not a valid semver version number.\n${resetTextColor}`
					);
				}

				const result = await versionPrompt();

				resolve(result);
			}
		);
	});
}

async function runTerraform() {
	await checkTerraformStateFile();
	/****************************************
	 * Prompt user for Remotion version
	 ****************************************/

	const remotionVersion = await versionPrompt();

	/****************************************
	 * Check if Remotion Service Account already exists
	 ****************************************/

	execSync('echo "Checking if Remotion Service Account already exists..."', {
		stdio: 'inherit',
	});

	const serviceAccountExists =
		execSync(
			`gcloud iam service-accounts list --filter="email:remotion-sa@${projectID}.iam.gserviceaccount.com" --project=${projectID}`,
			{
				stdio: ['inherit', 'pipe', 'pipe'],
			}
		)
			.toString()
			.trim().length > 0;

	if (serviceAccountExists) {
		execSync(
			`echo "${blueTextColor}remotion-sa@${projectID}.iam.gserviceaccount.com${resetTextColor} found, and does not need to be created.\n"`,
			{
				stdio: 'inherit',
			}
		);
	} else {
		execSync(
			`echo "No service account found, ${blueTextColor}remotion-sa@${projectID}.iam.gserviceaccount.com${resetTextColor} will be created.\n"`,
			{
				stdio: 'inherit',
			}
		);
	}

	/****************************************
	 * Check if Remotion IAM Role already exists
	 ****************************************/

	execSync('echo "Checking if Remotion IAM Role already exists..."', {
		stdio: 'inherit',
	});

	let iamRoleExists = false;
	try {
		execSync(`gcloud iam roles describe RemotionSA --project=${projectID}`, {
			stdio: ['inherit', 'pipe', 'pipe'],
		})
			.toString()
			.trim();
		iamRoleExists = true;
		execSync(
			`echo "${blueTextColor}RemotionSA${resetTextColor} role found, and does not need to be created.\n"`,
			{
				stdio: 'inherit',
			}
		);
	} catch {
		iamRoleExists = false;
		execSync(
			`echo "Role not found, ${blueTextColor}RemotionSA${resetTextColor} will be created.\n"`,
			{
				stdio: 'inherit',
			}
		);
	}

	/****************************************
	 * Terraform init, plan and apply. Will prompt user for confirmation before applying.
	 ****************************************/

	console.log(
		`\n\n${greenBackground}                Running Terraform               ${resetTextColor}`
	);
	const terraformVariables = `-var="remotion_version=${remotionVersion}" -var="project_id=${projectID}" -var="service_account_exists=${serviceAccountExists}"`;

	execSync('terraform init', {stdio: 'inherit'});

	if (iamRoleExists) {
		// If the role already exists, import the resource so that the permissions can be updated in place

		// If tfstate file exists, remove the role resource from state so that it can be imported fresh
		try {
			execSync('terraform state list', {stdio: 'pipe'});
			execSync(
				`terraform state rm google_project_iam_custom_role.remotion_sa`,
				{
					stdio: 'inherit',
				}
			);
		} catch {}

		execSync(
			`terraform import ${terraformVariables} google_project_iam_custom_role.remotion_sa projects/${projectID}/roles/RemotionSA`,
			{stdio: 'inherit'}
		);
	}

	execSync(`terraform plan ${terraformVariables} -out=remotion.tfplan`, {
		stdio: 'inherit',
	});

	// After the plan is complete, prompt the user to apply the plan or not
	function applyPrompt() {
		return new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			rl.question(
				`\n${greenTextColor}Do you want to apply the above plan? ${blueTextColor}`,
				async (answer) => {
					// reset terminal color
					rl.output.write(resetTextColor);
					rl.close();

					if (['yes', 'y'].indexOf(answer.trim().toLowerCase()) >= 0)
						return resolve(true);

					if (['no', 'n'].indexOf(answer.trim().toLowerCase()) >= 0)
						return resolve(false);

					console.log('Invalid response.');
					const result = await applyPrompt();

					resolve(result);
				}
			);
		});
	}

	const applyPlan = await applyPrompt();

	if (applyPlan) {
		execSync('terraform apply remotion.tfplan', {stdio: 'inherit'});
	} else {
		console.log(
			'Plan not applied, deployed Remotion version remains unchanged.'
		);
	}
}

async function updateRemotion() {
	await checkTerraformStateFile();

	/****************************************
	 * Check the existing remotion version
	 ****************************************/

	const deployedVersion = execSync(
		`gcloud iam service-accounts describe remotion-sa@${projectID}.iam.gserviceaccount.com | grep "description:" | awk '{print $2}'`,
		{
			stdio: ['inherit', 'pipe', 'pipe'],
		}
	)
		.toString()
		.trim();

	execSync(
		`echo "For project ${blueTextColor}${projectID}${resetTextColor}, Remotion version ${blueTextColor}${deployedVersion}${resetTextColor} is deployed.\n"`,
		{
			stdio: 'inherit',
		}
	);

	const remotionVersion = await versionPrompt();

	/****************************************
	 * Terraform init, plan and apply. Will prompt user for confirmation before applying.
	 ****************************************/

	console.log(
		`\n\n${greenBackground}                Running Terraform               ${resetTextColor}`
	);
	const terraformVariables = `-var="remotion_version=${remotionVersion}" -var="project_id=${projectID}" -var="service_account_exists=${true}"`;

	execSync('terraform init', {stdio: 'inherit'});

	// If tfstate file exists, remove the role resource from state so that it can be imported fresh
	try {
		execSync('terraform state list', {stdio: 'pipe'});
		execSync(`terraform state rm google_project_iam_custom_role.remotion_sa`, {
			stdio: 'inherit',
		});
	} catch {}

	execSync(
		`terraform import ${terraformVariables} google_project_iam_custom_role.remotion_sa projects/${projectID}/roles/RemotionSA`,
		{stdio: 'inherit'}
	);

	execSync(`terraform plan ${terraformVariables} -out=remotion.tfplan`, {
		stdio: 'inherit',
	});

	// After the plan is complete, prompt the user to apply the plan or not
	function applyPrompt() {
		return new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			rl.question(
				`\n${greenTextColor}Do you want to apply the above plan? ${blueTextColor}`,
				async (answer) => {
					// reset terminal color
					rl.output.write(resetTextColor);
					rl.close();

					if (['yes', 'y'].indexOf(answer.trim().toLowerCase()) >= 0)
						return resolve(true);

					if (['no', 'n'].indexOf(answer.trim().toLowerCase()) >= 0)
						return resolve(false);

					console.log('Invalid response.');
					const result = await applyPrompt();

					resolve(result);
				}
			);
		});
	}

	const applyPlan = await applyPrompt();

	if (applyPlan) {
		execSync('terraform apply remotion.tfplan', {stdio: 'inherit'});
		// After the resources are created, prompt the user to generate the .env file or not
		const generateEnvPrompt = await envPrompt();
		if (generateEnvPrompt) {
			await generateEnv();
		} else {
			console.log('No .env file generated.');
		}
	} else {
		console.log('Plan not applied, no changes made.');
		const generateEnvPrompt = await envPrompt();
		if (generateEnvPrompt) {
			await generateEnv();
		} else {
			console.log('No .env file generated.');
		}
	}
}

async function generateEnv() {
	/****************************************
	 * Generate .env file
	 ****************************************/

	function deleteKeyPrompt() {
		return new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			rl.question(
				`\n${greenTextColor}To delete one of these keys, type in the KEY_ID. Otherwise, press enter to continue. ${blueTextColor}`,
				async (answer) => {
					// reset terminal color
					rl.output.write(`${resetTextColor}`);

					if (answer.trim() === '') {
						rl.output.write(
							`${blueTextColor}<enter pressed>\n${resetTextColor}`
						);
						rl.close();
						return resolve(true);
					}

					rl.close();
					execSync(
						`gcloud iam service-accounts keys delete ${answer.trim()} --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
						{stdio: 'inherit'}
					);

					const result = await deleteKeyPrompt();

					resolve(result);
				}
			);
		});
	}

	execSync(
		`echo "\nThere is a limit of 10 keys per Service Account in GCP (not including the one managed by GCP itself).\n"`,
		{
			stdio: 'inherit',
		}
	);

	execSync(
		`echo "You should delete any of these keys that are no longer in use for ${blueTextColor}remotion-sa@${projectID}.iam.gserviceaccount.com${resetTextColor}:\n"`,
		{
			stdio: 'inherit',
		}
	);

	execSync(
		`gcloud iam service-accounts keys list --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
		{stdio: 'inherit'}
	);

	await deleteKeyPrompt();

	execSync(`echo "\nGenerating new Service Account key...\n"`, {
		stdio: 'inherit',
	});

	// generate key.json file
	try {
		execSync(
			`gcloud iam service-accounts keys create key.json --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
			{stdio: 'inherit'}
		);
	} catch (e) {
		execSync(
			`echo "\n${redBackground}Creation of new key failed, check if you have more than 10 keys already.${resetTextColor}\n\n"`,
			{stdio: 'inherit'}
		);
		throw e;
	}

	// generate .env file
	execSync(
		`echo "REMOTION_GCP_PRIVATE_KEY=$(jq '.private_key' key.json)" >> .env && echo "REMOTION_GCP_CLIENT_EMAIL=$(jq '.client_email' key.json)" >> .env && echo "REMOTION_GCP_PROJECT_ID=${projectID}" >> .env`,
		{stdio: 'inherit'}
	);

	// delete key.json file
	execSync('rm key.json', {stdio: 'inherit'});

	execSync(
		`echo "\n${greenTextColor}key.json has been deleted from this virtual machine, and .env file is ready for download.${resetTextColor}"`,
		{stdio: 'inherit'}
	);

	execSync(
		`echo "\n${redTextColor}To delete .env from this virtual machine after downloading, run${resetTextColor} rm .env"`,
		{stdio: 'inherit'}
	);
}
