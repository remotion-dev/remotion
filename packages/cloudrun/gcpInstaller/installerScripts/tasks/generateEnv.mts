import {execSync} from 'child_process';
import readline from 'readline';
import {checkEnvFile} from '../components/checkEnvFile.mjs';
import {colorCode} from '../components/colorCodes.mjs';

export async function generateEnv(projectID) {
	/****************************************
	 * Generate .env file
	 ****************************************/
	await checkEnvFile();

	function listAndCountKeys() {
		console.log('');

		execSync(
			`gcloud iam service-accounts keys list --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
			{stdio: 'inherit'}
		);

		const listOfKeys = execSync(
			`gcloud iam service-accounts keys list --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
			{
				stdio: ['inherit', 'pipe', 'pipe'],
			}
		)
			.toString()
			.trim()
			.split('\n');

		let keyCount = 0;
		if (listOfKeys.length > 1) {
			listOfKeys.forEach((key) => {
				const keyId = key.split(' ')[0];
				if (keyId === 'KEY_ID') return;
				keyCount += 1;
			});
		}

		// Minus 1 because the key managed by GCP is not counted
		execSync(`echo "\nThere are ${keyCount - 1} keys currently."`, {
			stdio: 'inherit',
		});
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
					rl.output.write(`${colorCode.resetText}`);

					if (answer.trim() === '') {
						rl.output.write(
							`${colorCode.blueText}<enter pressed>\n${colorCode.resetText}`
						);
						rl.close();
						return resolve(true);
					}

					rl.close();
					execSync(
						`gcloud iam service-accounts keys delete ${answer.trim()} --iam-account=remotion-sa@${projectID}.iam.gserviceaccount.com`,
						{stdio: 'inherit'}
					);

					listAndCountKeys();

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
		`echo "You should delete any of these keys that are no longer in use for ${colorCode.blueText}remotion-sa@${projectID}.iam.gserviceaccount.com${colorCode.resetText}:"`,
		{
			stdio: 'inherit',
		}
	);

	listAndCountKeys();

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
			`echo "\n${colorCode.redBackground}Creation of new key failed, check if you have more than 10 keys already.${colorCode.resetText}\n\n"`,
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
		`echo "\n${colorCode.greenText}key.json has been deleted from this virtual machine.${colorCode.resetText}"`,
		{stdio: 'inherit'}
	);

	execSync(
		`echo "\n${colorCode.redText}To delete .env from this virtual machine after downloading, run${colorCode.resetText} rm .env"`,
		{stdio: 'inherit'}
	);

	console.log(
		`\n${colorCode.blueBackground}        .env file is ready for download.        ${colorCode.resetText}`
	);
}
