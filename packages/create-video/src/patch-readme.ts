import fs from 'node:fs';
import path from 'node:path';
import type {PackageManager} from './pkg-managers';
import {
	getDevCommand,
	getInstallCommand,
	getRenderCommand,
	getRunCommand,
	getUpgradeCommand,
} from './pkg-managers';
import type {Template} from './templates';

// Templates name it README.md or readme.md; only case-insensitive filesystems treat those as the same file
export const findReadme = (projectRoot: string): string | null => {
	const readme = fs
		.readdirSync(projectRoot)
		.find((f) => f.toLowerCase() === 'readme.md');

	return readme === undefined ? null : path.join(projectRoot, readme);
};

export const patchReadmeMd = (
	projectRoot: string,
	packageManager: PackageManager,
	template: Template,
) => {
	const fileName = findReadme(projectRoot);
	if (fileName === null) {
		return;
	}

	const contents = fs.readFileSync(fileName, 'utf8');
	const newContents = contents
		.split('\n')
		.map((c) => {
			if (c.startsWith('npm install') || c.startsWith('npm i')) {
				return getInstallCommand(packageManager);
			}

			if (c.startsWith('npm run dev')) {
				return getDevCommand(packageManager, template);
			}

			if (c.startsWith('npx remotion render')) {
				return getRenderCommand(packageManager);
			}

			if (c.startsWith('npx remotion upgrade')) {
				return getUpgradeCommand(packageManager);
			}

			if (c.startsWith('npm run ')) {
				return getRunCommand(packageManager) + c.replace('npm run', '');
			}

			return c;
		})
		.join('\n');

	fs.writeFileSync(fileName, newContents);
};
