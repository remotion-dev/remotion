import {existsSync} from 'fs';
import {ConfigInternals} from './config';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

const candidates = [
	'./src/index.tsx',
	'./src/index.ts',
	'./src/index.js',
	'./remotion/index.tsx',
	'./remotion/index.ts',
	'./remotion/index.js',
];

const findCommonPath = () => {
	return candidates.find((candidate) => existsSync(candidate));
};

export const findEntryPoint = () => {
	// 1st priority: Explicitly passed entry point
	let file: string | null = parsedCli._[1];
	if (file) return file;

	// 2nd priority: Config file
	file = ConfigInternals.getEntryPoint();
	if (file) return file;

	// 3rd priority: Common paths
	const found = findCommonPath();

	if (found) {
		Log.verbose(`No entry point specified. Using ${found} as fallback`);
		return found;
	}

	return null;
};
