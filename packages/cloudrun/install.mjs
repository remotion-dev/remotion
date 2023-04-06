// this will be executed with node
import {execSync} from 'child_process';
import readline from 'readline';

execSync(
	'echo "\n\n\u001b[32;1m◀️◀️◀️ GCP project setup for Remotion Cloud Run ▶️▶️▶️\n\n\u001b[0m"',
	{stdio: 'inherit'}
);

/****************************************
 * Prompt user for Remotion version
 ****************************************/

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
			'What version of Remotion do you want to use (format: 1.0.0)? \u001b[34;1m',
			async (answer) => {
				rl.close();

				if (semverRegex.test(answer.trim())) return resolve(answer.trim());

				console.log(
					`${answer.trim()} \u001b[0mis not a valid version number.\n`
				);
				const result = await versionPrompt();

				resolve(result);
			}
		);
	});
}

const remotionVersion = await versionPrompt();

/****************************************
 * Retrieve and set current project ID
 ****************************************/

let projectID = '';

execSync('echo "\u001b[0m\nRetrieving current Project ID..."', {
	stdio: 'inherit',
});

projectID = execSync('gcloud config get-value project', {
	stdio: ['inherit', 'pipe', 'pipe'],
})
	.toString()
	.trim();

execSync(`echo "Project set to \u001b[34;1m${projectID}\u001b[0m\n"`, {
	stdio: 'inherit',
});

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
		`echo "\u001b[34;1mremotion-sa@${projectID}.iam.gserviceaccount.com\u001b[0m found, and does not need to be created.\n"`,
		{
			stdio: 'inherit',
		}
	);
} else {
	execSync(
		`echo "No service account found, \u001b[34;1mremotion-sa@${projectID}.iam.gserviceaccount.com\u001b[0m will be created.\n"`,
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
		`echo "\u001b[34;1mRemotionSA\u001b[0m role found, and does not need to be created.\n"`,
		{
			stdio: 'inherit',
		}
	);
} catch {
	iamRoleExists = false;
	execSync(
		`echo "Role not found, \u001b[34;1mRemotionSA\u001b[0m will be created.\n"`,
		{
			stdio: 'inherit',
		}
	);
}

/****************************************
 * Terraform commands
 ****************************************/

console.log('◀️ Running Terraform ▶️');
const terraformVariables = `-var="remotion_version=${remotionVersion}" -var="project_id=${projectID}" -var="service_account_exists=${serviceAccountExists}"`;

execSync('terraform init', {stdio: 'inherit'});

if (iamRoleExists) {
	// If the role already exists, import the resource so that the permissions can be updated in place

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
}

execSync(
	`terraform plan ${terraformVariables} -out=remotion.tfplan -compact-warnings`,
	{stdio: 'inherit'}
);

// After the plan is complete, prompt the user to apply the plan or not

function applyPrompt() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			'\n\u001b[32;1mDo you want to apply the above plan? \u001b[34;1m',
			async (answer) => {
				// reset terminal color
				rl.output.write('\u001b[0m');
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
	console.log('Plan not applied, no changes made.');
}
