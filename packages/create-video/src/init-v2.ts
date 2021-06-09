import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import * as CreateDirectory from './create-directory';
import {Log} from './log';

function assertValidName(folderName: string) {
	const validation = CreateDirectory.validateName(folderName);
	if (typeof validation === 'string') {
		throw new Error(
			`Cannot create an app named ${chalk.red(
				`"${folderName}"`
			)}. ${validation}`
		);
	}
}

async function assertFolderEmptyAsync(
	projectRoot: string,
	folderName?: string
) {
	if (
		!(await CreateDirectory.assertFolderEmptyAsync({
			projectRoot,
			folderName,
			overwrite: false,
		}))
	) {
		const message = 'Try using a new directory name, or moving these files.';
		Log.newLine();
		Log.info(message);
		Log.newLine();
		throw new Error(message);
	}
}

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
					const validation = CreateDirectory.validateName(
						path.basename(path.resolve(name))
					);
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
			if (error.code !== 'ABORTED') {
				throw error;
			}
		}

		const projectRoot = path.resolve(projectName);
		const folderName = path.basename(projectRoot);

		assertValidName(folderName);

		await fs.ensureDir(projectRoot);

		await assertFolderEmptyAsync(projectRoot, folderName);
	}
};
