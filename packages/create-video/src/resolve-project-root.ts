import chalk from 'chalk';
import fs from 'node:fs';
import {readdir, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Log} from './log';
import {mkdirp} from './mkdirp';
import prompts from './prompts';
import {isFlagSelected, isTmpFlagSelected} from './select-template';
import type {Template} from './templates';
import {validateName} from './validate-name';

function assertValidName(folderName: string) {
	const validation = validateName(folderName);
	if (typeof validation === 'string') {
		throw new Error(
			`Cannot create an app named ${chalk.red(
				`"${folderName}"`,
			)}. ${validation}`,
		);
	}
}

function assertFolderEmptyAsync(projectRoot: string): {exists: boolean} {
	const conflicts = fs
		.readdirSync(projectRoot)
		.filter((file: string) => !/\.iml$/.test(file));

	if (conflicts.length > 0) {
		Log.newLine();
		Log.error(`Something already exists at "${projectRoot}"`);
		Log.error('Try using a new directory name, or moving these files.');
		Log.newLine();
		return {exists: true};
	}

	return {exists: false};
}

export const resolveProjectRoot = async (options?: {
	directoryArgument?: string | null;
	selectedTemplate?: Template;
}): Promise<{
	projectRoot: string;
	folderName: string;
}> => {
	if (isTmpFlagSelected()) {
		Log.info('Creating the video in a temporary directory.');
		const randomName = `remotion-video-${Math.random().toString(36).slice(2)}`;
		const randomRoot = path.join(tmpdir(), randomName);
		mkdirp(randomRoot);

		return {projectRoot: randomRoot, folderName: randomName};
	}

	let projectName = '';
	let directlyCreateInCurrentDir = false;

	// If a directory argument was provided, use it directly
	if (options?.directoryArgument) {
		projectName = options.directoryArgument;
	} else {
		// Print selected template info before prompting for directory
		if (options?.selectedTemplate && isFlagSelected) {
			Log.info(
				`Selected template: ${chalk.blue(options.selectedTemplate.shortName)}`,
			);
		}

		try {
			const currentMs = Date.now();
			const hour = 60 * 60 * 1000;
			const dirCreateMs = (await stat(process.cwd())).ctimeMs;
			const fileList = await readdir(process.cwd());
			const fileCount = fileList.filter((f) => !f.startsWith('.')).length;

			if (fileCount === 0 && currentMs - dirCreateMs < hour) {
				// User seems to have created a new directory which is empty, and cd'd into it. Let's create the project here!
				directlyCreateInCurrentDir = true;
			}

			if (directlyCreateInCurrentDir) {
				projectName = process.cwd();
			} else {
				const {answer} = await prompts({
					type: 'text',
					name: 'answer',
					message: 'Directory to create your project',
					initial: 'my-video',
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
			}
		} catch (error) {
			// Handle the aborted message in a custom way.
			if ((error as {code: string}).code !== 'ABORTED') {
				throw error;
			}
		}
	}

	const projectRoot = path.resolve(projectName);
	const folderName = path.basename(projectRoot);

	if (!directlyCreateInCurrentDir) {
		// if a folder is already created, no point of checking if it's valid
		assertValidName(folderName);
		mkdirp(projectRoot);
	}

	if (assertFolderEmptyAsync(projectRoot).exists) {
		return resolveProjectRoot(options);
	}

	return {projectRoot, folderName};
};
