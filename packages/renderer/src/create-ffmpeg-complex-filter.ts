import {FfmpegFilterCalculation} from './calculate-ffmpeg-filters';

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

export const createFfmpegComplexFilter = (
	filters: FfmpegFilterCalculation[]
): [string, string] | null => {
	if (!filters.length) {
		return null;
	}
	const complexFilter = [
		...filters.map((f) => f.filter),
		createMix(filters),
	].join(';');
	return ['-filter_complex', complexFilter];
};
