import {execSync} from 'child_process';
import readline from 'readline';
import {colorCode} from './colorCodes.mjs';

export function projectIdPrompt() {
	return new Promise<string>((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			`GCP Project ID is not set. What is the Project ID? ${colorCode.blueText}`,
			(answer) => {
				rl.write(`\n${colorCode.resetText}`);
				rl.close();

				execSync(`gcloud config set project ${answer.trim()}`, {
					stdio: 'inherit',
				});

				// ensuring that user has selected a valid project
				const projectID = execSync('gcloud config get-value project', {
					stdio: ['inherit', 'pipe', 'pipe'],
				})
					.toString()
					.trim();

				if (!projectID) {
					console.log('Operation cancelled.');
					process.exit(1);
				}

				resolve(projectID);
			},
		);
	});
}
