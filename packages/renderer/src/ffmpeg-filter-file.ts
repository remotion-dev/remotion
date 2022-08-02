// While an FFMPEG filter can be passed directly, if it's too long
// we run into Windows command length limits.

import fs from 'fs';
import path from 'path';
import type {DownloadMap} from './assets/download-map';

export const makeFfmpegFilterFile = async (
	complexFilter: string,
	downloadMap: DownloadMap
) => {
	const random = Math.random().toString().replace('.', '');
	const filterFile = path.join(
		downloadMap.complexFilter,
		'complex-filter-' + random + '.txt'
	);
	await fs.promises.writeFile(filterFile, complexFilter);

	return {
		file: filterFile,
		cleanup: () => {
			fs.unlinkSync(filterFile);
		},
	};
};
