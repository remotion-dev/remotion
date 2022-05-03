import fs from 'fs';
import path from 'path';
import {createFfmpegMergeFilter} from './create-ffmpeg-merge-filter';
import {tmpDir} from './tmp-dir';

export const createFfmpegComplexFilter = async (
	filters: number
): Promise<{
	complexFilterFlag: [string, string] | null;
	cleanup: () => void;
}> => {
	if (filters === 0) {
		return {complexFilterFlag: null, cleanup: () => undefined};
	}

	const complexFilter = createFfmpegMergeFilter(filters);
	// TODO: one audio is the same as 0 audios?
	if (complexFilter === null) {
		return {complexFilterFlag: null, cleanup: () => undefined};
	}

	const tempPath = tmpDir('remotion-complex-filter');
	const filterFile = path.join(tempPath, 'complex-filter.txt');
	await fs.promises.writeFile(filterFile, complexFilter);

	return {
		complexFilterFlag: ['-filter_complex_script', filterFile],
		cleanup: () => {
			(fs.promises.rm ?? fs.promises.rmdir)(tempPath, {
				recursive: true,
			}).catch((err) => {
				console.error('Could not delete a temp file');
				console.error(err);
				console.error('Do you have the minimum Node.JS installed?');
			});
		},
	};
};
