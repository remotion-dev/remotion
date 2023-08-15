import {callFf} from './call-ffmpeg';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const createSilentAudio = async ({
	numberOfSeconds,
	outName,
}: {
	numberOfSeconds: number;
	outName: string;
}) => {
	await callFf('ffmpeg', [
		'-f',
		'lavfi',
		'-i',
		`anullsrc=r=${DEFAULT_SAMPLE_RATE}`,
		'-c:a',
		'pcm_s16le',
		'-t',
		String(numberOfSeconds),
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		outName,
	]);
};
