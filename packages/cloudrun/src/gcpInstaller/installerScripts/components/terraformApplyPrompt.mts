import readline from 'readline';
import {colorCode} from './colorCodes.mjs';

export function terraformApplyPrompt() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			`\n${colorCode.greenText}Do you want to apply the above plan? ${colorCode.blueText}`,
			async (answer) => {
				// reset terminal color
				rl.write(colorCode.resetText);
				rl.close();

				if (['yes', 'y'].indexOf(answer.trim().toLowerCase()) >= 0)
					return resolve(true);

				if (['no', 'n'].indexOf(answer.trim().toLowerCase()) >= 0)
					return resolve(false);

				console.log('Invalid response.');
				const result = await terraformApplyPrompt();

				resolve(result);
			},
		);
	});
}
