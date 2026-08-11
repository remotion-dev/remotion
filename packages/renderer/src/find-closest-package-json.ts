import fs from 'node:fs';
import path from 'node:path';

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
		return process.cwd();
	}

	return path.dirname(closestPackageJson);
};
