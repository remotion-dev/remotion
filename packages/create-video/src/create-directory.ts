import fs from 'fs-extra';
import * as path from 'path';
import {Log} from './log';

const TOLERABLE_FILES = [
	// System
	'.DS_Store',
	'Thumbs.db',
	// Git
	'.git',
	'.gitattributes',
	'.gitignore',
	// Project
	'.npmignore',
	'.travis.yml',
	'LICENSE',
	'docs',
	'.idea',
	// Package manager
	'npm-debug.log',
	'yarn-debug.log',
	'yarn-error.log',
];

export function validateName(name?: string): string | true {
	if (typeof name !== 'string' || name === '') {
		return 'The project name can not be empty.';
	}
	if (!/^[a-z0-9@.\-_]+$/i.test(name)) {
		return 'The project name can only contain URL-friendly characters (alphanumeric and @ . -  _)';
	}
	return true;
}

export function getConflictsForDirectory(
	projectRoot: string,
	tolerableFiles: string[] = TOLERABLE_FILES
): string[] {
	return fs
		.readdirSync(projectRoot)
		.filter(
			(file: string) => !(/\.iml$/.test(file) || tolerableFiles.includes(file))
		);
}

export async function assertFolderEmptyAsync({
	projectRoot,
	folderName = path.dirname(projectRoot),
	overwrite,
}: {
	projectRoot: string;
	folderName?: string;
	overwrite: boolean;
}): Promise<boolean> {
	const conflicts = getConflictsForDirectory(projectRoot);
	if (conflicts.length) {
		Log.info(
			`The directory ${Log.chalk.green(
				folderName
			)} has files that might be overwritten:`
		);
		Log.newLine();
		for (const file of conflicts) {
			Log.info(`  ${file}`);
		}

		if (overwrite) {
			Log.newLine();
			Log.info(`Removing existing files from ${Log.chalk.green(folderName)}`);
			await Promise.all(
				conflicts.map((conflict) => fs.remove(path.join(projectRoot, conflict)))
			);
			return true;
		}

		return false;
	}
	return true;
}
