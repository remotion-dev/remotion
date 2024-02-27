import type {AudioCodec} from './audio-codec';
import {OUTPUT_FILTER_NAME} from './create-ffmpeg-merge-filter';
import {truthy} from './truthy';

export const compressAudio = ({
	audioCodec,
	forceLossless,
	outName,
}: {
	audioCodec: AudioCodec;
	forceLossless: boolean;
	outName: string;
}) => {
	const args = [
		['-c:a', forceLossless ? 'pcm_s16le' : 'libfdk_aac'],
		forceLossless ? null : ['-f', 'adts'],
		['-map', `[${OUTPUT_FILTER_NAME}]`],
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);
};
