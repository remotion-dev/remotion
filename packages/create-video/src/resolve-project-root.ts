import chalk from 'chalk';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Log} from './log';
import {mkdirp} from './mkdirp';
import prompts from './prompts';
import {isTmpFlagSelected} from './select-template';
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

export const resolveProjectRoot = async (): Promise<{
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

	try {
		const {answer} = await prompts({
			type: 'text',
			name: 'answer',
			message: 'What would you like to name your video?',
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
	} catch (error) {
		// Handle the aborted message in a custom way.
		if ((error as {code: string}).code !== 'ABORTED') {
			throw error;
		}
	}

	const projectRoot = path.resolve(projectName);
	const folderName = path.basename(projectRoot);

	assertValidName(folderName);

	mkdirp(projectRoot);

	if (assertFolderEmptyAsync(projectRoot).exists) {
		return resolveProjectRoot();
	}

	return {projectRoot, folderName};
};
