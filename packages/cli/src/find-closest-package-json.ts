import fs from 'fs';
import path from 'path';
import {Log} from './log';

const recursionLimit = 5;

export const findClosestPackageJson = (): string | null => {
	let currentDir = process.cwd();
	let possiblePackageJson = '';
	for (let i = 0; i < recursionLimit; i++) {
		possiblePackageJson = path.join(currentDir, 'package.json');
		const exists = fs.existsSync(possiblePackageJson);
		if (exists) {
			return possiblePackageJson;
		}

		currentDir = path.dirname(currentDir);
	}

	return null;
};

export const findRemotionRoot = (): string => {
	const closestPackageJson = findClosestPackageJson();
	if (closestPackageJson === null) {
		Log.error(
			'Could not find a package.json in the current directory or any of the ' +
				recursionLimit +
				' parent directories. Is this a Remotion project?'
		);
		process.exit(1);
	}

	return path.dirname(closestPackageJson);
};
