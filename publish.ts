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

	promises.push(
		p(async () => {
			const licensePath = path.join(packagePath, 'LICENSE.md');
			const copiedLicense =
				packageJson.license?.includes('LICENSE.md') && !existsSync(licensePath);

			if (copiedLicense) {
				copyFileSync(path.join(process.cwd(), 'LICENSE.md'), licensePath);
			}

			try {
				await $`bun publish --tolerate-republish`.cwd(packagePath);
			} finally {
				if (copiedLicense) {
					unlinkSync(licensePath);
				}
			}
		}),
	);
}

await Promise.all(promises);
