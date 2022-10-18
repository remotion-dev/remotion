import fs from 'fs';
import path from 'path';

export const ensureOutputDirectory = (outputLocation: string) => {
	const dirName = path.dirname(outputLocation);

	if (!fs.existsSync(dirName)) {
		fs.mkdirSync(dirName, {
			recursive: true,
		});
	}
};
