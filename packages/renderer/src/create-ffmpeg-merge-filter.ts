import type {PreprocessedAudioTrack} from './preprocess-audio-track';
import {truthy} from './truthy';

export const OUTPUT_FILTER_NAME = 'outputaudio';

export const createFfmpegMergeFilter = (inputs: PreprocessedAudioTrack[]) => {
	const pads = inputs.map((input, index) => {
		const filters = [
			input.filter.pad_start ? input.filter.pad_start : null,
			input.filter.pad_end ? 'apad=pad_len=' + input.filter.pad_end : null,
		];
		return `[${index}:a]${filters.filter(truthy).join(',')}[padded${index}]`;
	});

	return [
		...pads,
		`${new Array(inputs.length)
			.fill(true)
			.map((_, i) => {
				return `[padded${i}]`;
			})
			.join('')}amix=inputs=${
			inputs.length
		}:dropout_transition=0:normalize=0[${OUTPUT_FILTER_NAME}]`,
	].join(';');
};
