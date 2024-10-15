import {existsSync, mkdirSync} from 'fs';
import {join} from 'path';

export const createPublicFolder = (projectRoot: string) => {
	const target = join(projectRoot, 'public');
	if (existsSync(target)) {
		return;
	}

	mkdirSync(target);
};
