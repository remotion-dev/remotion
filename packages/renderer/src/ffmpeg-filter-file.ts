// While an FFMPEG filter can be passed directly, if it's too long
// we run into Windows command length limits.

import fs from 'fs';
import path from 'path';
import {deleteDirectory} from './delete-directory';
import {tmpDir} from './tmp-dir';

export const makeFfmpegFilterFile = async (complexFilter: string) => {
	const tempPath = tmpDir('remotion-complex-filter');
	const filterFile = path.join(tempPath, 'complex-filter.txt');
	await fs.promises.writeFile(filterFile, complexFilter);

	return {
		file: filterFile,
		cleanup: () => {
			deleteDirectory(filterFile);
		},
	};
};
