const getTsrsPath = require('./tsrs-path.cjs');

const windowsWatch =
	process.platform === 'win32' &&
	(process.argv.includes('--watch') || process.argv.includes('-w'));

if (!windowsWatch && getTsrsPath(require.resolve) !== null) {
	require('../../node_modules/tsrs/bin/tsrs');
} else {
	require('../../node_modules/typescript/bin/tsc');
}
