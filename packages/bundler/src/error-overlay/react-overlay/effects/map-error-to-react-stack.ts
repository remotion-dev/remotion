import {Internals} from 'remotion';

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

	if (!err.stack.startsWith('Error: Module build failed')) {
		return null;
	}

	const split = err.stack.split('\n');

	return (
		split
			.map((s) => {
				if (s.startsWith('Error')) {
					return null;
				}

				if (s.match(/^\s+at/g)) {
					return null;
				}

				const matchWebpackOrEsbuild = s.match(/(.*):([0-9]+):([0-9]+): (.*)/);

				if (!matchWebpackOrEsbuild) {
					return null;
				}

				return {
					fileName: matchWebpackOrEsbuild[1],
					lineNumber: Number(matchWebpackOrEsbuild[2]),
					columnNumber: Number(matchWebpackOrEsbuild[3]),
					message: matchWebpackOrEsbuild[4],
				};
			})
			.filter(Internals.truthy)[0] ?? null
	);
};
