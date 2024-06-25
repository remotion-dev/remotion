// bun set-version.mjs 4.0.178
import {execSync} from 'child_process';
import {
	existsSync,
	lstatSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from 'fs';
import path from 'path';

let version = process.argv[2];
let noCommit = process.argv.includes('--no-commit');

if (!version) {
	throw new Error('Please specify a version');
}

if (version.startsWith('v')) {
	version = version.slice(1);
}

const dirs = readdirSync('packages')
	.filter((dir) =>
		lstatSync(path.join(process.cwd(), 'packages', dir)).isDirectory(),
	)
	.filter((dir) =>
		existsSync(path.join(process.cwd(), 'packages', dir, 'package.json')),
	);

for (const dir of [path.join('cloudrun', 'container'), ...dirs]) {
	const packageJsonPath = path.join(
		process.cwd(),
		'packages',
		dir,
		'package.json',
	);
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	packageJson.version = version;
	writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJson, null, '\t') + '\n',
	);
	try {
		console.log('setting version for', dir);
	} catch (e) {
		// console.log(e.message);
	}
}

execSync('bun ensure-correct-version.ts', {
	cwd: 'packages/core',
});

execSync('bun test src/monorepo', {
	cwd: 'packages/it-tests',
	stdio: 'inherit',
});

execSync('node build.mjs --all', {
	cwd: 'packages/renderer',
	stdio: 'inherit',
});

execSync('pnpm build', {
	cwd: 'packages/cloudrun',
	stdio: 'inherit',
});

if (!noCommit) {
	execSync('git add .', {stdio: 'inherit'});
	execSync(`git commit -m "v${version}"`, {stdio: 'inherit'});
	execSync(`git tag v${version}`, {stdio: 'inherit'});
}
