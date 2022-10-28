import {existsSync} from 'fs';
import {ConfigInternals} from './config';
import {Log} from './log';

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

export const findEntryPoint = (args: string[]) => {
	// 1st priority: Explicitly passed entry point
	let file: string | null = args[0];
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
