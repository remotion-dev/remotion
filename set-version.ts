// bun set-version.mjs 4.0.178
import {execSync} from 'child_process';
import {
	existsSync,
	lstatSync,
	readFileSync,
	readdirSync,
	unlinkSync,
	writeFileSync,
} from 'fs';
import path from 'path';
import {FEATURED_TEMPLATES} from './packages/create-video/src/templates.ts';

let version = process.argv[2];
let noCommit = process.argv.includes('--no-commit');

if (!version) {
	throw new Error('Please specify a version');
}

if (version.startsWith('v')) {
	version = version.slice(1);
}

// Ensure we are on the main branch
const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
	encoding: 'utf-8',
}).trim();

if (currentBranch !== 'main') {
	throw new Error('Please be on the main branch');
}

const dirs = readdirSync('packages')
	.filter((dir) =>
		lstatSync(path.join(process.cwd(), 'packages', dir)).isDirectory(),
	)
	.filter((dir) =>
		existsSync(path.join(process.cwd(), 'packages', dir, 'package.json')),
	);

for (const dir of [path.join('cloudrun', 'container'), ...dirs]) {
	const localTemplates = FEATURED_TEMPLATES.map(
		(t) => t.templateInMonorepo,
	).filter(Boolean) as string[];
	if (localTemplates.includes(dir)) {
		continue;
	}

	const packageJsonPath = path.join(
		process.cwd(),
		'packages',
		dir,
		'package.json',
	);
	const tsconfigBuildPath = path.join(
		process.cwd(),
		'packages',
		dir,
		'tsconfig.tsbuildinfo',
	);
	if (existsSync(tsconfigBuildPath)) {
		unlinkSync(tsconfigBuildPath);
	}

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
execSync('bun ensure-correct-version.ts', {
	cwd: 'packages/media-parser',
});

execSync('bun run build', {
	stdio: 'inherit',
});

execSync('bun run generate', {
	stdio: 'inherit',
	cwd: 'packages/google-fonts',
});

execSync('bun test src/monorepo', {
	cwd: 'packages/it-tests',
	stdio: 'inherit',
});

execSync('bun build.ts --all', {
	cwd: 'packages/compositor',
	stdio: 'inherit',
});

execSync('bun i', {
	stdio: 'inherit',
});

if (!noCommit) {
	execSync('git add .', {stdio: 'inherit'});
	execSync(`git commit --allow-empty -m "v${version}"`, {stdio: 'inherit'});
	execSync(`git tag -d v${version} 2>/dev/null || true`, {
		stdio: 'inherit',
	});
	execSync(`git push --delete origin v${version} 2>/dev/null || true`, {
		stdio: 'inherit',
	});

	execSync(`git tag v${version} 2>/dev/null || true`, {stdio: 'inherit'});
}
