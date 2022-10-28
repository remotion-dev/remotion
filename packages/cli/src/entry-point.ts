import {existsSync} from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {Log} from './log';

const candidates = [
	path.join('remotion', 'index.tsx'),
	path.join('remotion', 'index.ts'),
	path.join('remotion', 'index.js'),
	path.join('src', 'index.tsx'),
	path.join('src', 'index.ts'),
	path.join('src', 'index.js'),
];

const findCommonPath = () => {
	return candidates.find((candidate) => existsSync(candidate));
};

export const findEntryPoint = (
	args: string[]
): {
	file: string | null;
	remainingArgs: string[];
} => {
	// 1st priority: Explicitly passed entry point
	let file: string | null = args[0];
	if (file) return {file, remainingArgs: args.slice(1)};

	// 2nd priority: Config file
	file = ConfigInternals.getEntryPoint();
	if (file) return {file, remainingArgs: args};

	// 3rd priority: Common paths
	const found = findCommonPath();

	if (found) {
		Log.verbose(`No entry point specified. Using ${found} as fallback`);
		return {file: found, remainingArgs: args};
	}

	return {file: null, remainingArgs: args};
};
