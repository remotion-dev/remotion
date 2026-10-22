import {createRequire} from 'node:module';
import {dirname} from 'node:path';
import {createTwoslasher as createOriginalTwoslasher} from 'twoslash';

export * from 'twoslash';

const require = createRequire(import.meta.url);
const toolingRequire = createRequire(
	require.resolve('@remotion/typescript-tools/package.json'),
);

export const createTwoslasher = (options = {}) =>
	createOriginalTwoslasher({
		// Bundled workers otherwise resolve the root TypeScript 7 library directory.
		tsLibDirectory: dirname(toolingRequire.resolve('typescript')),
		...options,
	});
