import type {FfmpegExecutable} from './ffmpeg-executable';
import {getFfmpegVersion} from './ffmpeg-flags';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';
import {truthy} from './truthy';

export const OUTPUT_FILTER_NAME = 'outputaudio';

export const createFfmpegMergeFilter = async ({
	inputs,
	ffmpegExecutable,
	remotionRoot,
}: {
	inputs: PreprocessedAudioTrack[];
	ffmpegExecutable: FfmpegExecutable;
	remotionRoot: string;
}) => {
	const ffmpegVersion = await getFfmpegVersion({
		ffmpegExecutable,
		remotionRoot,
	});
	const supportsNormalize =
		ffmpegVersion === null ||
		(ffmpegVersion[0] === 4 && ffmpegVersion[1] >= 4) ||
		ffmpegVersion[0] >= 5;
	const pads = inputs.map((input, index) => {
		const filters = [
			input.filter.pad_start ? input.filter.pad_start : null,
			input.filter.pad_end ? input.filter.pad_end : null,
			'acopy',
		];
		return `[${index}:a]${filters.filter(truthy).join(',')}[padded${index}]`;
	});

	const normalize = supportsNormalize ? ':normalize=0' : '';

	return [
		...pads,
		`${new Array(inputs.length)
			.fill(true)
			.map((_, i) => {
				return `[padded${i}]`;
			})
			.join('')}amix=inputs=${
			inputs.length
		}:dropout_transition=0${normalize}[${OUTPUT_FILTER_NAME}]`,
	].join(';');
};
