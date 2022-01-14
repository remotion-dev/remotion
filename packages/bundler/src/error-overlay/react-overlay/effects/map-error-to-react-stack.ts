import {Internals} from 'remotion';
import {ReactFrame} from './proxy-console';

export const mapErrorToReactStack = (err: Error): ReactFrame[] => {
	if (!err.stack) {
		return [];
	}

	const split = err.stack.split('\n');

	return split
		.map((s): ReactFrame | null => {
			if (s.startsWith('Error')) {
				return null;
			}

			if (s.match(/^\s+at/g)) {
				return null;
			}

			const matchWebpackOrEsbuild = s.match(/(.*):([0-9]+):([0-9]+):(.*)/);

			if (!matchWebpackOrEsbuild) {
				return null;
			}

			return {
				fileName: matchWebpackOrEsbuild[1],
				lineNumber: Number(matchWebpackOrEsbuild[2]),
				name: matchWebpackOrEsbuild[4],
			};
		})
		.filter(Internals.truthy);
};
