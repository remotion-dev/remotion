import {execSync} from 'child_process';
import readline from 'readline';
import {checkEnvFile} from '../components/checkEnvFile.mjs';
import {colorCode} from '../components/colorCodes.mjs';

export async function generateEnv(projectID: string) {
	/****************************************
	 * Generate .env file
	 ****************************************/

	const gloudSAKeyCmd = `gcloud iam service-accounts keys list --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com --format json | 
	jq -r '.[] | select(.keyType != "SYSTEM_MANAGED") | "\\(.name | split("/") | last) \\(.validAfterTime) \\(.validBeforeTime) \\(.keyOrigin)"'`;

	function countKeys() {
		const output = execSync(gloudSAKeyCmd, {
			stdio: ['inherit', 'pipe', 'pipe'],
		})
			.toString()
			.trim();

		const listOfKeys = output === '' ? [] : output.split('\n');

		const keyCount = listOfKeys.length;

		const pluralized = keyCount === 1 ? 'key' : 'keys';

		execSync(`echo "\n${keyCount} service account ${pluralized} currently"`, {
			stdio: 'inherit',
		});

		return keyCount > 0;
	}

	function listKeys() {
		console.log('');

		execSync(
			`{
				echo "KEY_ID CREATED_AT EXPIRES_AT KEY_ORIGIN"; 
				${gloudSAKeyCmd}
				} | column -t`,

			{stdio: 'inherit'},
		);
	}

	function deleteKeyPrompt() {
		return new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			rl.question(
				`\n${colorCode.greenText}To delete one of these keys, type in the KEY_ID. Otherwise, press enter to continue. ${colorCode.blueText}`,
				async (answer) => {
					// reset terminal color
					rl.write(`${colorCode.resetText}`);

					if (answer.trim() === '') {
						rl.write(
							`${colorCode.blueText}<enter pressed>\n${colorCode.resetText}`,
						);
						rl.close();
						return resolve(true);
					}

					rl.close();
					execSync(
						`gcloud iam service-accounts keys delete ${answer.trim()} --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
						{stdio: 'inherit'},
					);

					listKeys();

					const result = await deleteKeyPrompt();

					resolve(result);
				},
			);
		});
	}

	// count keys
	const existingKeys = countKeys();

	if (existingKeys) {
		execSync(
			`echo "\nThere is a limit of 10 keys per Service Account in GCP (not including the one managed by GCP itself).\n"`,
			{
				stdio: 'inherit',
			},
		);

		execSync(
			`echo "You should delete any of these keys that are no longer in use for ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText}:"`,
			{
				stdio: 'inherit',
			},
		);

		listKeys();

		await deleteKeyPrompt();
	}

	await checkEnvFile();

	execSync(`echo "\nGenerating new Service Account key...\n"`, {
		stdio: 'inherit',
	});

	// generate key.json file
	try {
		execSync(
			`gcloud iam service-accounts keys create key.json --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
			{stdio: 'inherit'},
		);
	} catch (e) {
		execSync(
			`echo "\n${colorCode.redBackground}Creation of new key failed, check if you have more than 10 keys already.${colorCode.resetText}\n\n"`,
			{stdio: 'inherit'},
		);
		throw e;
	}

	// generate .env file
	execSync(
		`echo "REMOTION_GCP_PRIVATE_KEY=$(jq '.private_key' key.json)" >> .env && echo "REMOTION_GCP_CLIENT_EMAIL=$(jq --raw-output '.client_email' key.json)" >> .env && echo "REMOTION_GCP_PROJECT_ID=${projectID}" >> .env`,
		{stdio: 'inherit'},
	);

	// delete key.json file
	execSync('rm key.json', {stdio: 'inherit'});

	execSync(
		`echo "\n${colorCode.greenText}key.json has been deleted from this virtual machine.${colorCode.resetText}"`,
		{stdio: 'inherit'},
	);

	execSync(
		`echo "\n${colorCode.redText}To delete .env from this virtual machine after downloading, run${colorCode.resetText} rm .env"`,
		{stdio: 'inherit'},
	);

	console.log(
		`\n${colorCode.blueBackground}        .env file is ready for download.        ${colorCode.resetText}`,
	);
}
