import {execSync} from 'child_process';
import readline from 'readline';
import {colorCode} from './colorCodes.mjs';

export function taskPrompt(projectID: string) {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			// @ts-expect-error process.stdin
			input: process.stdin,
			// @ts-expect-error process.stdout is not a WritableStream
			output: process.stdout,
		});

		rl.question(
			`What would you like to do?\n[1] Setup/Update Cloud Run rendering in ${colorCode.blueText}${projectID}${colorCode.resetText}.\n[2] ${colorCode.blueText}${projectID}${colorCode.resetText} is already set up for Remotion. Manage keys and/or generate a new .env file for the Remotion Service Account.\n${colorCode.blueText}`,
			async (answer) => {
				// reset terminal color
				rl.write(`\n${colorCode.resetText}`);

				if (answer.trim() === '1') {
					rl.write(
						`${colorCode.blueText}<Terraform selected>\n\n${colorCode.resetText}`,
					);
					rl.close();
					return resolve('runTerraform');
				}

				if (answer.trim() === '2') {
					rl.write(
						`${colorCode.blueText}<key management selected>\n\n${colorCode.resetText}`,
					);
					rl.close();
					return resolve('generateEnv');
				}

				rl.close();
				execSync(
					`echo "${colorCode.redText}Invalid selection. Please enter 1 or 2.\n${colorCode.resetText}"`,
					{
						stdio: 'inherit',
					},
				);

				const result = await taskPrompt(projectID);

				resolve(result);
			},
		);
	});
}
