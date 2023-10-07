// While an FFMPEG filter can be passed directly, if it's too long
// we run into Windows command length limits.

import fs, {existsSync} from 'node:fs';
import path from 'node:path';
import type {DownloadMap} from './assets/download-map';
import type {FilterWithoutPaddingApplied} from './stringify-ffmpeg-filter';

export const makeFfmpegFilterFile = (
	complexFilter: FilterWithoutPaddingApplied,
	downloadMap: DownloadMap,
) => {
	return makeFfmpegFilterFileStr(complexFilter.filter, downloadMap);
};

export const makeFfmpegFilterFileStr = async (
	complexFilter: string,
	downloadMap: DownloadMap,
) => {
	const random = Math.random().toString().replace('.', '');
	const filterFile = path.join(
		downloadMap.complexFilter,
		'complex-filter-' + random + '.txt',
	);

	// Race condition: Sometimes the download map is deleted before the file is written.
	// Can remove this once the original bug has been fixed
	if (!existsSync(downloadMap.complexFilter)) {
		fs.mkdirSync(downloadMap.complexFilter, {recursive: true});
	}

	await fs.promises.writeFile(filterFile, complexFilter);

	return {
		file: filterFile,
		cleanup: () => {
			fs.unlinkSync(filterFile);
		},
	};
};
