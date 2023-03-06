import {callFf} from './call-ffmpeg';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const convertToPcm = async ({
	input,
	outName,
}: {
	input: string;
	outName: string;
}) => {
	await callFf('ffmpeg', [
		'-i',
		input,
		'-c:a',
		'pcm_s16le',
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		outName,
	]);
};
