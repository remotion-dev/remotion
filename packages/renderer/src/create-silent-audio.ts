import {RenderInternals} from '.';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const createSilentAudio = async ({
	numberOfSeconds,
	outName,
}: {
	numberOfSeconds: number;
	outName: string;
}) => {
	await RenderInternals.callFf('ffmpeg', [
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
