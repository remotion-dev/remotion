// While an FFMPEG filter can be passed directly, if it's too long
// we run into Windows command length limits.

import fs from 'fs';
import path from 'path';
import type {DownloadMap} from './assets/download-map';
import {deleteDirectory} from './delete-directory';

export const makeFfmpegFilterFile = async (
	complexFilter: string,
	downloadMap: DownloadMap
) => {
	const filterFile = path.join(downloadMap.complexFilter, 'complex-filter.txt');
	await fs.promises.writeFile(filterFile, complexFilter);

	return {
		file: filterFile,
		cleanup: () => {
			deleteDirectory(downloadMap.complexFilter);
		},
	};
};
