import {existsSync} from 'node:fs';
import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

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

export type EntryPointReason =
	| 'argument passed - found in cwd'
	| 'argument passed - found in root'
	| 'argument passed'
	| 'config file'
	| 'common paths'
	| 'none found';

const findCommonPath = (remotionRoot: string) => {
	return candidates.find((candidate) =>
		existsSync(path.resolve(remotionRoot, candidate)),
	);
};

const isBundledCode = (inputPath: string) => {
	return (
		existsSync(inputPath) && existsSync(path.join(inputPath, 'index.html'))
	);
};

export const findEntryPoint = ({
	entryPoint,
	configuredEntryPoint,
	remotionRoot,
	logLevel,
	allowDirectory,
}: {
	entryPoint: string | undefined;
	configuredEntryPoint: string | null;
	remotionRoot: string;
	logLevel: LogLevel;
	allowDirectory: boolean;
}): {
	file: string | null;
	reason: EntryPointReason;
} => {
	let file = entryPoint ?? null;
	let reason: EntryPointReason = 'none found';
	let isDirectory = false;

	if (file) {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			'Checking if',
			file,
			'is the entry file',
		);
		const cwdResolution = path.resolve(process.cwd(), file);
		const remotionRootResolution = path.resolve(remotionRoot, file);

		if (existsSync(cwdResolution)) {
			file = cwdResolution;
			reason = 'argument passed - found in cwd';
			isDirectory = isBundledCode(cwdResolution);
		} else if (existsSync(remotionRootResolution)) {
			file = remotionRootResolution;
			reason = 'argument passed - found in root';
			isDirectory = isBundledCode(remotionRootResolution);
		} else if (RenderInternals.isServeUrl(file)) {
			reason = 'argument passed';
		}
	}

	if (!file) {
		if (configuredEntryPoint) {
			file = path.resolve(remotionRoot, configuredEntryPoint);
			reason = 'config file';
			isDirectory = isBundledCode(file);
		} else {
			const commonPath = findCommonPath(remotionRoot);
			if (commonPath) {
				file = path.resolve(remotionRoot, commonPath);
				reason = 'common paths';
			}
		}
	}

	if (!file) {
		return {
			file: null,
			reason: 'none found',
		};
	}

	if (!RenderInternals.isServeUrl(file)) {
		if (!existsSync(file)) {
			throw new Error(
				`${file} was chosen as the entry point (reason = ${reason}) but it does not exist.`,
			);
		}

		if (isDirectory && !allowDirectory) {
			throw new Error(
				`${file} was chosen as the entry point (reason = ${reason}) but it is a directory - it needs to be a file.`,
			);
		}
	}

	return {file, reason};
};
