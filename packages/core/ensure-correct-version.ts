const path = require('node:path');
const fs = require('node:fs');
const cp = require('node:child_process');

const packageJson = JSON.parse(fs.readFileSync('package.json'));
const {version} = packageJson;
const src =
	`
// Automatically generated on publish

/**
 * @description Provides the current version number of the Remotion library.
 * @see [Documentation](https://remotion.dev/docs/version)
 * @returns {string} The current version of the remotion package
 */
export const VERSION = '${version}';
`.trim() + '\n';

fs.writeFileSync(path.resolve(process.cwd(), 'src/version.ts'), src);

cp.execSync('pnpm run make');
cp.execSync('bun x tsc -d');

const distFile = fs.readFileSync('dist/esm/version.mjs', 'utf-8');

if (!distFile.includes(version)) {
	console.log('In dist file, did not include ' + JSON.stringify(version));
	process.exit(1);
}

const distFileCjs = fs.readFileSync('dist/cjs/version.js', 'utf-8');

if (!distFileCjs.includes(version)) {
	console.log('In dist file, did not include ' + JSON.stringify(version));
	process.exit(1);
}

console.log('Updated version to v' + version);

const wrongDistFileExists = fs.existsSync('dist/index.js', 'utf-8');
if (wrongDistFileExists) {
	throw new Error('Wrong dist file exists');
}

const wrongDistFileExists2 = fs.existsSync('dist/index.mjs', 'utf-8');
if (wrongDistFileExists2) {
	throw new Error('Wrong dist file exists');
}
