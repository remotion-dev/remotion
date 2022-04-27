import fs from 'fs';
import path from 'path';
import {FfmpegFilterCalculation} from './calculate-ffmpeg-filters';
import {tmpDir} from './tmp-dir';

const createMix = (filters: FfmpegFilterCalculation[]) => {
	const baseFilter = filters
		.map((asset) => {
			return `[a${asset.streamIndex}]`;
		})
		.join('');
	const options = [
		// Specify the number of inputs we give
		`inputs=${filters.length}`,
		// Disable any fade in transitions when a track stops
		'dropout_transition=0',
		// Audio track is as long as the longest input
		'duration=longest',
	];
	return `${baseFilter}amix=${options.join(':')}`;
};

export const createFfmpegComplexFilter = async (
	filters: FfmpegFilterCalculation[]
): Promise<{
	complexFilterFlag: [string, string] | null;
	cleanup: () => void;
}> => {
	if (!filters.length) {
		return {complexFilterFlag: null, cleanup: () => undefined};
	}

	const complexFilter = [
		...filters.map((f) => f.filter),
		createMix(filters),
	].join(';');
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
