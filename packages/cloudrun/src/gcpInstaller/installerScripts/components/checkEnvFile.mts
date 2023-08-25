import {execSync} from 'child_process';
import {existsSync} from 'fs';
import readline from 'readline';
import {colorCode} from './colorCodes.mjs';

function deleteEnvPrompt() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			`
${colorCode.redText}.env file exists in this directory. Delete and create new .env file [yes, no]? ${colorCode.blueText}`,
			async (answer) => {
				// reset terminal color
				rl.write(`\n${colorCode.resetText}`);
				rl.close();

				if (['yes', 'y'].indexOf(answer.trim().toLowerCase()) >= 0) {
					execSync('rm .env');
					execSync(
						`echo "${colorCode.redText}Deleted .env file.${colorCode.resetText}"`,
					);
					return resolve(true);
				}

				if (['no', 'n'].indexOf(answer.trim().toLowerCase()) >= 0) {
					execSync('echo ".env file present, and not deleted, exiting..."', {
						stdio: 'inherit',
					});
					process.exit(1);
				}

				console.log('Invalid response.\n');
				const result = await deleteEnvPrompt();

				resolve(result);
			},
		);
	});
}

export async function checkEnvFile() {
	/****************************************
	 * Check for existing .env file
	 ****************************************/
	if (existsSync('.env')) {
		await deleteEnvPrompt();
	}
}
