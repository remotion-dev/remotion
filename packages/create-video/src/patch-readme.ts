import fs from 'fs';
import path from 'path';
import type {PackageManager} from './pkg-managers';
import {
	getDevCommand,
	getInstallCommand,
	getRenderCommand,
	getRunCommand,
} from './pkg-managers';
import type {Template} from './templates';

export const patchReadmeMd = (
	projectRoot: string,
	packageManager: PackageManager,
	template: Template
) => {
	const fileName = path.join(projectRoot, 'README.md');

	const contents = fs.readFileSync(fileName, 'utf8');
	const newContents = contents
		.split('\n')
		.map((c) => {
			if (c.startsWith('npm install') || c.startsWith('npm i')) {
				return getInstallCommand(packageManager);
			}

			if (c.startsWith('npm start')) {
				return getDevCommand(packageManager, template);
			}

			if (c.startsWith('npm run build')) {
				return getRenderCommand(packageManager);
			}

			if (c.startsWith('npm run ')) {
				return getRunCommand(packageManager) + c.replace('npm run', '');
			}

			return c;
		})
		.join('\n');

	fs.writeFileSync(fileName, newContents);
};
