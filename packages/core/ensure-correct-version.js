const path = require('node:path');
const fs = require('node:fs');
const cp = require('node:child_process');

const packageJson = JSON.parse(fs.readFileSync('package.json'));
const {version} = packageJson;
const src =
	`
// Automatically generated on publish
export const VERSION = '${version}';
`.trim() + '\n';

fs.writeFileSync(path.resolve(process.cwd(), 'src/version.ts'), src);

cp.execSync('npx tsc');

const distFile = fs.readFileSync('dist/version.js', 'utf-8');

if (!distFile.includes(version)) {
	console.log('In dist file, did not include version');
	process.exit(1);
}

console.log('Updated version to v' + version);
