import chalk from 'chalk';
import path from 'path';
import prompts from 'prompts';
import {validateName} from './create-directory';

export const init = async () => {
	let projectName = process.argv[2];

	console.log(projectName, 'new');
	if (!projectName) {
		try {
			const {answer} = await prompts({
				type: 'text',
				name: 'answer',
				message: 'What would you like to name your app?',
				initial: 'my-app',
				validate: (name) => {
					const validation = validateName(path.basename(path.resolve(name)));
					if (typeof validation === 'string') {
						return 'Invalid project name: ' + validation;
					}
					return true;
				},
			});

			if (typeof answer === 'string') {
				projectName = answer.trim();
			}
		} catch (error) {
			// Handle the aborted message in a custom way.
			console.log('nice');
			if (error.code !== 'ABORTED') {
				throw error;
			}
		}
		const validation = validateName(projectName);
		if (typeof validation === 'string') {
			throw new Error(
				`Cannot create an app named ${chalk.red(
					`"${projectName}"`
				)}. ${validation}`
			);
		}
	}
};
