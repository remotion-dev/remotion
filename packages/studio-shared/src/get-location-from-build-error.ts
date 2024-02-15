import {NoReactInternals} from 'remotion/no-react';

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

	if (
		!err.stack.startsWith('Error: Module build failed') &&
		!err.stack.startsWith('Error: Cannot find module')
	) {
		return null;
	}

	const split = err.stack.split('\n');

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

				if (s.includes('webpackMissingModule')) {
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
