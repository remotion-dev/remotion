import fs from 'node:fs';
import path from 'node:path';

export const ensureOutputDirectory = (outputLocation: string) => {
	const dirName = path.dirname(outputLocation);

	if (!fs.existsSync(dirName)) {
		fs.mkdirSync(dirName, {
			recursive: true,
		});
	}
};
