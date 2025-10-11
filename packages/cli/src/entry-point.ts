import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {ConfigInternals} from './config';
import {Log} from './log';

const candidates = [
	path.join('src', 'index.ts'),
	path.join('src', 'index.tsx'),
	path.join('src', 'index.js'),
	path.join('src', 'index.mjs'),
	path.join('remotion', 'index.tsx'),
	path.join('remotion', 'index.ts'),
	path.join('remotion', 'index.js'),
	path.join('remotion', 'index.mjs'),
	path.join('src', 'remotion', 'index.tsx'),
	path.join('src', 'remotion', 'index.ts'),
	path.join('src', 'remotion', 'index.js'),
	path.join('src', 'remotion', 'index.mjs'),
];

const findCommonPath = (remotionRoot: string) => {
	return candidates.find((candidate) =>
		existsSync(path.resolve(remotionRoot, candidate)),
	);
};

type FoundReason =
	| 'argument passed - found in cwd'
	| 'argument passed - found in root'
	| 'argument passed'
	| 'config file'
	| 'common paths'
	| 'none found';

export const findEntryPoint = ({
	args,
	logLevel,
	remotionRoot,
	allowDirectory,
}: {
	args: (string | number)[];
	remotionRoot: string;
	logLevel: LogLevel;
	allowDirectory: boolean;
}): {
	file: string | null;
	remainingArgs: (string | number)[];
	reason: FoundReason;
} => {
	const result = findEntryPointInner(args, remotionRoot, logLevel);
	if (result.file === null) {
		return result;
	}

	if (RenderInternals.isServeUrl(result.file)) {
		return result;
	}

	if (!existsSync(result.file)) {
		throw new Error(
			`${result.file} was chosen as the entry point (reason = ${result.reason}) but it does not exist.`,
		);
	}

	if (result.isDirectory && !allowDirectory) {
		throw new Error(
			`${result.file} was chosen as the entry point (reason = ${result.reason}) but it is a directory - it needs to be a file.`,
		);
	}

	return result;
};

const isBundledCode = (p: string) => {
	return existsSync(p) && existsSync(path.join(p, 'index.html'));
};

const findEntryPointInner = (
	args: (string | number)[],
	remotionRoot: string,
	logLevel: LogLevel,
): {
	file: string | null;
	isDirectory: boolean;
	remainingArgs: (string | number)[];
	reason: FoundReason;
} => {
	// 1st priority: Explicitly passed entry point
	let file: string | null = args[0] ? args[0].toString() : null;
	if (file) {
		Log.verbose(
			{indent: false, logLevel},
			'Checking if',
			file,
			'is the entry file',
		);
		const cwdResolution = path.resolve(process.cwd(), file);
		const remotionRootResolution = path.resolve(remotionRoot, file);
		// Checking if file was found in CWD
		if (existsSync(cwdResolution)) {
			return {
				file: cwdResolution,
				remainingArgs: args.slice(1),
				reason: 'argument passed - found in cwd',
				isDirectory: isBundledCode(cwdResolution),
			};
		}

		// Checking if file was found in remotion root
		if (existsSync(remotionRootResolution)) {
			return {
				file: remotionRootResolution,
				remainingArgs: args.slice(1),
				reason: 'argument passed - found in root',
				isDirectory: isBundledCode(remotionRootResolution),
			};
		}

		if (RenderInternals.isServeUrl(file)) {
			return {
				file,
				remainingArgs: args.slice(1),
				reason: 'argument passed',
				isDirectory: false,
			};
		}
	}

	// 2nd priority: Config file
	file = ConfigInternals.getEntryPoint();
	if (file) {
		Log.verbose(
			{indent: false, logLevel},
			'Entry point from config file is',
			file,
		);

		return {
			file: path.resolve(remotionRoot, file),
			remainingArgs: args,
			reason: 'config file',
			isDirectory: isBundledCode(path.resolve(remotionRoot, file)),
		};
	}

	// 3rd priority: Common paths
	const found = findCommonPath(remotionRoot);

	if (found) {
		const absolutePath = path.resolve(remotionRoot, found);
		Log.verbose(
			{indent: false, logLevel},
			'Selected',
			absolutePath,
			'as the entry point because file exists and is a common entry point and no entry point was explicitly selected',
		);
		return {
			file: absolutePath,
			remainingArgs: args,
			reason: 'common paths',
			isDirectory: false,
		};
	}

	return {
		file: null,
		remainingArgs: args,
		reason: 'none found',
		isDirectory: false,
	};
};
