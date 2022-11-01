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

const findCommonPath = (remotionRoot: string) => {
	return candidates.find((candidate) =>
		existsSync(path.resolve(remotionRoot, candidate))
	);
};

export const findEntryPoint = (
	args: string[],
	remotionRoot: string
): {
	file: string | null;
	remainingArgs: string[];
	reason: string;
} => {
	// 1st priority: Explicitly passed entry point
	let file: string | null = args[0];
	if (file) {
		Log.verbose('Checking if', file, 'is the entry file');
		// Intentionally resolving CLI files to CWD, while resolving config file to remotionRoot
		if (existsSync(path.resolve(process.cwd(), file))) {
			return {file, remainingArgs: args.slice(1), reason: 'argument passed'};
		}
	}

	// 2nd priority: Config file
	file = ConfigInternals.getEntryPoint();
	if (file) {
		Log.verbose('Entry point from config file is', file);

		return {file, remainingArgs: args, reason: 'config file'};
	}

	// 3rd priority: Common paths
	const found = findCommonPath(remotionRoot);

	if (found) {
		Log.verbose(
			'Selected',
			found,
			'as the entry point because file exists and is a common entry point and no entry point was explicitly selected'
		);
		return {file: found, remainingArgs: args, reason: 'common paths'};
	}

	return {file: null, remainingArgs: args, reason: 'none found'};
};
