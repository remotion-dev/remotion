import fs from 'fs';
import path from 'path';
import type {PackageManager} from './pkg-managers';
import {
	getInstallCommand,
	getRenderCommand,
	getRunCommand,
	getStartCommand,
} from './pkg-managers';

export const patchReadmeMd = (
	projectRoot: string,
	packageManager: PackageManager
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
				return getStartCommand(packageManager);
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
