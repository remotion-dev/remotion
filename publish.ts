import {$} from 'bun';
import {existsSync, lstatSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import limit from 'p-limit';
import {FEATURED_TEMPLATES} from './packages/create-video/src/templates';

const p = limit(4);

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

	promises.push(
		p(() => {
			return $`bun publish --tolerate-republish`.cwd(packagePath);
		}),
	);
}

await Promise.all(promises);
