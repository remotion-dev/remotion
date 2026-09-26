import {
	copyFileSync,
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	unlinkSync,
} from 'node:fs';
import path from 'node:path';
import {$} from 'bun';
import limit from 'p-limit';
import {FEATURED_TEMPLATES} from './packages/create-video/src/templates';
import {shouldReleasePackage} from './packages/studio-shared/src/release-package-policy';

const p = limit(4);
const args = process.argv.slice(2);
const listOnly = args.includes('--list');
const tagArg = args.find((arg) => arg.startsWith('--tag='));
const releaseTag = tagArg?.slice('--tag='.length) ?? null;
const onlyArg = args.find((arg) => arg.startsWith('--only='));
const onlyPackage = onlyArg?.slice('--only='.length) ?? null;

if (
	args.some((arg) => arg !== '--list' && arg !== tagArg && arg !== onlyArg) ||
	(listOnly && (releaseTag !== null || onlyPackage !== null)) ||
	(onlyPackage !== null && releaseTag === null) ||
	releaseTag === '' ||
	onlyPackage === ''
) {
	throw new Error(
		'Usage: bun publish.ts [--list | --tag=<dist-tag> [--only=<package>]]',
	);
}

const releaseVersion = JSON.parse(
	readFileSync(
		path.join(process.cwd(), 'packages', 'core', 'package.json'),
		'utf-8',
	),
).version as string;

const dirs = readdirSync('packages')
	.filter((dir) =>
		lstatSync(path.join(process.cwd(), 'packages', dir)).isDirectory(),
	)
	.filter((dir) =>
		existsSync(path.join(process.cwd(), 'packages', dir, 'package.json')),
	);

const promises: Promise<unknown>[] = [];
let foundOnlyPackage = false;

for (const dir of dirs) {
	const localTemplates = FEATURED_TEMPLATES.map(
		(t) => t.templateInMonorepo,
	).filter(Boolean) as string[];
	if (localTemplates.includes(dir)) {
		continue;
	}

	const packagePath = path.join(process.cwd(), 'packages', dir);
	const packageJsonPath = path.join(packagePath, 'package.json');
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	if (packageJson.private) {
		continue;
	}

	if (
		!shouldReleasePackage({
			packageName: packageJson.name,
			releaseVersion,
		})
	) {
		continue;
	}
	if (onlyPackage !== null && packageJson.name !== onlyPackage) {
		continue;
	}
	foundOnlyPackage = true;
	if (listOnly) {
		console.log(packageJson.name);
		continue;
	}

	promises.push(
		p(async () => {
			const licensePath = path.join(packagePath, 'LICENSE.md');
			const copiedLicense =
				packageJson.license?.includes('LICENSE.md') && !existsSync(licensePath);

			if (copiedLicense) {
				copyFileSync(path.join(process.cwd(), 'LICENSE.md'), licensePath);
			}

			try {
				if (releaseTag === null) {
					await $`bun publish --tolerate-republish`.cwd(packagePath);
				} else {
					await $`bun publish --tag=${releaseTag}`.cwd(packagePath);
				}
			} finally {
				if (copiedLicense) {
					unlinkSync(licensePath);
				}
			}
		}),
	);
}

if (onlyPackage !== null && !foundOnlyPackage) {
	throw new Error(`No releasable package named ${onlyPackage}`);
}

await Promise.all(promises);
