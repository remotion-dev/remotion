import {execSync} from 'child_process';
// Components
import {checkTerraformStateFile} from '../components/checkTerraformStateFile.mjs';
import {colorCode} from '../components/colorCodes.mjs';
import {generateEnvPrompt} from '../components/generateEnvPrompt.mjs';
import {terraformApplyPrompt} from '../components/terraformApplyPrompt.mjs';
import {tfSuccessScreen} from '../components/tfSuccessScreen.mjs';
// Tasks
import {generateEnv} from './generateEnv.mjs';

export async function setupGcpProject(projectID: string) {
	checkTerraformStateFile(projectID);

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
			},
		)
			.toString()
			.trim().length > 0;

	if (serviceAccountExists) {
		execSync(
			`echo "${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} found, and does not need to be created.\n"`,
			{
				stdio: 'inherit',
			},
		);
	} else {
		execSync(
			`echo "No service account found, ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} will be created.\n"`,
			{
				stdio: 'inherit',
			},
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
			`echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role found, and does not need to be created.\n"`,
			{
				stdio: 'inherit',
			},
		);
	} catch {
		iamRoleExists = false;
		execSync(
			`echo "Role not found, ${colorCode.blueText}RemotionSA${colorCode.resetText} will be created.\n"`,
			{
				stdio: 'inherit',
			},
		);
	}

	/****************************************
	 * Check if Remotion IAM Role already exists
	 ****************************************/
	let iamRoleAttached = false;
	if (serviceAccountExists && iamRoleExists) {
		execSync(
			'echo "Checking if Remotion IAM Role is already attached to Remotion Service Account"',
			{
				stdio: 'inherit',
			},
		);

		iamRoleAttached =
			serviceAccountExists &&
			Boolean(
				execSync(
					`gcloud projects get-iam-policy ${projectID} --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:remotion-sa@${projectID}.iam.gserviceaccount.com"`,
					{
						stdio: ['inherit', 'pipe', 'pipe'],
					},
				)
					.toString()
					.trim()
					.split('\n')
					.find((role) => {
						return role === `projects/${projectID}/roles/RemotionSA`;
					}),
			);

		if (iamRoleAttached) {
			execSync(
				`echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role already attached to ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText} found, and does not need to be re-attached.\n"`,
				{
					stdio: 'inherit',
				},
			);
		} else {
			execSync(
				`echo "${colorCode.blueText}RemotionSA${colorCode.resetText} role not attached to ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText}, and will be attached now.\n"`,
				{
					stdio: 'inherit',
				},
			);
		}
	}

	/****************************************
	 * Check if cloudresourcemanager API is enabled
	 ****************************************/
	execSync(
		'echo "Checking if Cloud Resource Manager and Cloud Run APIs are enabled..."',
		{
			stdio: 'inherit',
		},
	);

	const listOfServices = execSync(
		`gcloud services list --project=${projectID}`,
		{
			stdio: ['inherit', 'pipe', 'pipe'],
		},
	)
		.toString()
		.trim()
		.split('\n');

	const resourceManagerEnabled = Boolean(
		listOfServices.find((api) => {
			return api.startsWith('cloudresourcemanager.googleapis.com');
		}),
	);

	if (resourceManagerEnabled) {
		execSync(
			`echo "${colorCode.blueText}cloudresourcemanager.googleapis.com${colorCode.resetText} API already enabled on project."`,
			{
				stdio: 'inherit',
			},
		);
	} else {
		execSync(
			`echo "${colorCode.blueText}cloudresourcemanager.googleapis.com${colorCode.resetText} API not enabled on project, and will be enabled now."`,
			{
				stdio: 'inherit',
			},
		);
	}

	const cloudRunEnabled = Boolean(
		listOfServices.find((api) => {
			return api.startsWith('run.googleapis.com');
		}),
	);

	if (cloudRunEnabled) {
		execSync(
			`echo "${colorCode.blueText}run.googleapis.com${colorCode.resetText} API already enabled on project.\n"`,
			{
				stdio: 'inherit',
			},
		);
	} else {
		execSync(
			`echo "${colorCode.blueText}run.googleapis.com${colorCode.resetText} API not enabled on project, and will be enabled now.\n"`,
			{
				stdio: 'inherit',
			},
		);
	}

	/****************************************
	 * Terraform init, plan and apply. Will prompt user for confirmation before applying.
	 ****************************************/

	console.log(
		`\n\n${colorCode.greenBackground}                Running Terraform               ${colorCode.resetText}`,
	);
	const terraformVariables = `-var="project_id=${projectID}"`;

	execSync('terraform init', {stdio: 'inherit'});

	// Import resources as required

	if (serviceAccountExists) {
		// If the service account already exists, import the resource so that the permissions can be updated in place
		execSync(
			`echo "Attempting to import current state from GCP of ${colorCode.blueText}Remotion Service Account${colorCode.resetText}."`,
			{
				stdio: 'inherit',
			},
		);

		// If the service account is already in tfstate file, skip this step. Otherwise, import it to the state file
		try {
			execSync('terraform state list google_service_account.remotion_sa', {
				stdio: 'pipe',
			});
		} catch {
			execSync(
				`terraform import ${terraformVariables} google_service_account.remotion_sa projects/${projectID}/serviceAccounts/remotion-sa@${projectID}.iam.gserviceaccount.com`,
				{stdio: 'inherit'},
			);
		}
	}

	if (iamRoleExists) {
		// If the role already exists, import the resource so that the permissions can be updated in place
		execSync(
			`echo "Attempting to import current state from GCP of ${colorCode.blueText}Remotion IAM role${colorCode.resetText}."`,
			{
				stdio: 'inherit',
			},
		);

		// If the IAM role is already in tfstate file, skip this step. Otherwise, import it to the state file
		try {
			execSync(
				'terraform state list google_project_iam_custom_role.remotion_sa',
				{
					stdio: 'pipe',
				},
			);
		} catch {
			execSync(
				`terraform import ${terraformVariables} google_project_iam_custom_role.remotion_sa projects/${projectID}/roles/RemotionSA`,
				{stdio: 'inherit'},
			);
		}
	}

	if (iamRoleAttached) {
		// If the role is already attached, import the resource so that the permissions can be updated in place
		execSync(
			`echo "Attempting to import current state from GCP of ${colorCode.blueText}Remotion IAM role <-> Remotion Service Account${colorCode.resetText}."`,
			{
				stdio: 'inherit',
			},
		);

		// If role binding is already in tfstate file, skip this step. Otherwise, import it to the state file
		try {
			execSync('terraform state list google_project_iam_member.remotion_sa', {
				stdio: 'pipe',
			});
		} catch {
			execSync(
				`terraform import ${terraformVariables} google_project_iam_member.remotion_sa "${projectID} projects/${projectID}/roles/RemotionSA serviceAccount:remotion-sa@${projectID}.iam.gserviceaccount.com"`,
				{stdio: 'inherit'},
			);
		}
	}

	if (resourceManagerEnabled) {
		// If the Cloud Resource Manager API is already attached, import the resource so that the permissions can be updated in place
		execSync(
			`echo "Attempting to import current state from GCP of ${colorCode.blueText}Cloud Resource Manager API${colorCode.resetText}."`,
			{
				stdio: 'inherit',
			},
		);

		// If cloud resource manager service already in tfstate file, skip this step. Otherwise, import it to the state file
		try {
			execSync(
				'terraform state list google_project_service.cloud_resource_manager',
				{
					stdio: 'pipe',
				},
			);
		} catch {
			execSync(
				`terraform import ${terraformVariables} google_project_service.cloud_resource_manager ${projectID}/cloudresourcemanager.googleapis.com`,
				{stdio: 'inherit'},
			);
		}
	}

	if (cloudRunEnabled) {
		// If the Cloud Run API is already attached, import the resource so that the permissions can be updated in place
		execSync(
			`echo "Attempting to import current state from GCP of ${colorCode.blueText}Cloud Run API${colorCode.resetText}."`,
			{
				stdio: 'inherit',
			},
		);

		// If Cloud Run service already in tfstate file, skip this step. Otherwise, import it to the state file
		try {
			execSync('terraform state list google_project_service.cloud_run', {
				stdio: 'pipe',
			});
		} catch {
			execSync(
				`terraform import ${terraformVariables} google_project_service.cloud_run ${projectID}/run.googleapis.com`,
				{stdio: 'inherit'},
			);
		}
	}

	// Perform Terraform Plan

	execSync(`terraform plan ${terraformVariables} -out=remotion.tfplan`, {
		stdio: 'inherit',
	});

	// After the plan is complete, prompt the user to apply the plan or not
	const applyPlan = await terraformApplyPrompt();

	if (applyPlan) {
		execSync('terraform apply remotion.tfplan', {stdio: 'inherit'});
		// After the resources are created, prompt the user to generate the .env file or not
		tfSuccessScreen();
		const generateEnvFile = await generateEnvPrompt();
		if (generateEnvFile) {
			await generateEnv(projectID);
		} else {
			console.log('No .env file generated.');
		}
	} else {
		console.log(
			`\n${colorCode.blueBackground}       Plan not applied, no changes made.       ${colorCode.resetText}`,
		);
		const generateEnvFile = await generateEnvPrompt();
		if (generateEnvFile) {
			await generateEnv(projectID);
		} else {
			console.log(
				`\n${colorCode.blueBackground}             No .env file generated             ${colorCode.resetText}`,
			);
		}
	}
}
