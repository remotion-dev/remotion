import {RenderInternals} from '@remotion/renderer';
import {existsSync} from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {Log} from './log';

const candidates = [
	path.join('src', 'index.ts'),
	path.join('src', 'index.tsx'),
	path.join('src', 'index.js'),
	path.join('remotion', 'index.tsx'),
	path.join('remotion', 'index.ts'),
	path.join('remotion', 'index.js'),
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
		const cwdResolution = path.resolve(process.cwd(), file);
		const remotionRootResolution = path.resolve(remotionRoot, file);
		// Checking if file was found in CWD
		if (existsSync(cwdResolution)) {
			return {
				file: cwdResolution,
				remainingArgs: args.slice(1),
				reason: 'argument passed - found in cwd',
			};
		}

		// Checking if file was found in remotion root
		if (existsSync(remotionRootResolution)) {
			return {
				file: remotionRootResolution,
				remainingArgs: args.slice(1),
				reason: 'argument passed - found in root',
			};
		}

		if (RenderInternals.isServeUrl(file)) {
			return {file, remainingArgs: args.slice(1), reason: 'argument passed'};
		}
	}

	// 2nd priority: Config file
	file = ConfigInternals.getEntryPoint();
	if (file) {
		Log.verbose('Entry point from config file is', file);

		return {
			file: path.resolve(remotionRoot, file),
			remainingArgs: args,
			reason: 'config file',
		};
	}

	// 3rd priority: Common paths
	const found = findCommonPath(remotionRoot);

	if (found) {
		const absolutePath = path.resolve(remotionRoot, found);
		Log.verbose(
			'Selected',
			absolutePath,
			'as the entry point because file exists and is a common entry point and no entry point was explicitly selected'
		);
		return {
			file: absolutePath,
			remainingArgs: args,
			reason: 'common paths',
		};
	}

	return {file: null, remainingArgs: args, reason: 'none found'};
};
