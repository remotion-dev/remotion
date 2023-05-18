import {execSync} from 'child_process';
import readline from 'readline';
import {colorCode} from './colorCodes.mjs';

export function remotionVersionPrompt() {
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
			`What version of Remotion do you want to use (format: 1.0.0)? ${colorCode.blueText}`,
			async (answer) => {
				rl.write(`\n${colorCode.resetText}`);
				rl.close();

				let fileError = false;
				if (semverRegex.test(answer.trim())) {
					try {
						execSync(`gcloud storage ls gs://remotion-sa/sa-permissions.json`);
						return resolve(answer.trim());
					} catch {
						fileError = true;
					}
				}

				if (fileError) {
					console.log(
						`${
							colorCode.redText
						}Cannot find permissions file that matches version ${answer.trim()}.\n${
							colorCode.resetText
						}`
					);
				} else {
					console.log(
						`${
							colorCode.redText
						}${answer.trim()} is not a valid semver version number.\n${
							colorCode.resetText
						}`
					);
				}

				const result = await remotionVersionPrompt();

				resolve(result);
			}
		);
	});
}
