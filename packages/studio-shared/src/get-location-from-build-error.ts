import {NoReactInternals} from 'remotion/no-react';
import {stripAnsi} from './ansi';

export type ErrorLocation = {
	fileName: string;
	columnNumber: number;
	lineNumber: number;
	message: string;
};

export const getLocationFromBuildError = (err: Error): ErrorLocation | null => {
	if (!err.stack) {
		return null;
	}

	const stack = stripAnsi(err.stack);
	if (
		!/^Error:\s*(?:×\s+)?Module build failed/.test(stack) &&
		!stack.startsWith('Error: Cannot find module')
	) {
		return null;
	}

	const split = stack.split('\n');

	// SWC nests its diagnostic and source location inside Rspack's error tree.
	// Resolve it before considering the runtime stack of the throwing module.
	for (let i = 0; i < split.length; i++) {
		const location = split[i].match(/\[(.+):(\d+):(\d+)\]/);
		if (!location) {
			continue;
		}

		const diagnostic = split
			.slice(0, i)
			.reverse()
			.map((line) => line.match(/^[\s│├╰─▶]*(?:[×x]\s+)+(.+)$/)?.[1])
			.find(NoReactInternals.truthy);
		if (diagnostic) {
			return {
				fileName: location[1],
				lineNumber: Number(location[2]),
				columnNumber: Number(location[3]),
				message: diagnostic,
			};
		}
	}

	return (
		split
			.map((s) => {
				if (s.startsWith('Error')) {
					return null;
				}

				const matchWebpackOrEsbuild = s.match(/(.*):([0-9]+):([0-9]+): (.*)/);

				if (matchWebpackOrEsbuild) {
					return {
						fileName: matchWebpackOrEsbuild[1],
						lineNumber: Number(matchWebpackOrEsbuild[2]),
						columnNumber: Number(matchWebpackOrEsbuild[3]),
						message: matchWebpackOrEsbuild[4],
					};
				}

				const matchMissingModule = s.match(/\s+at(.*)\s\((.*)\)/);
				if (!matchMissingModule) {
					return null;
				}

				if (
					s.includes('webpackMissingModule') ||
					s.includes('__rspack_missing_module')
				) {
					return null;
				}

				const [, filename] = matchMissingModule;

				return {
					columnNumber: 0,
					lineNumber: 1,
					message: split[0],
					fileName: filename.trim(),
				};
			})
			.filter(NoReactInternals.truthy)[0] ?? null
	);
};
