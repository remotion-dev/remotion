import execa from 'execa';
import {getExecutablePath} from './compositor/get-executable-path';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const createSilentAudio = async ({
	numberOfSeconds,
	outName,
}: {
	numberOfSeconds: number;
	outName: string;
}) => {
	await execa(
		getExecutablePath('ffmpeg'),
		[
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
		],
		{
			cwd: getExecutablePath('ffmpeg-cwd'),
		}
	);
};
