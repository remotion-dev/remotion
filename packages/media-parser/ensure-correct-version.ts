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

cp.execSync('pnpm run make');
cp.execSync('bun x tsc -d');
