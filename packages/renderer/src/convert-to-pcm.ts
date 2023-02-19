import execa from 'execa';
import {getExecutablePath} from './compositor/get-executable-path';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const convertToPcm = async ({
	input,
	outName,
}: {
	input: string;
	outName: string;
}) => {
	await execa(
		getExecutablePath('ffmpeg'),
		[
			'-i',
			input,
			'-c:a',
			'pcm_s16le',
			'-ar',
			String(DEFAULT_SAMPLE_RATE),
			outName,
		],
		{
			cwd: getExecutablePath('ffmpeg-cwd'),
		}
	);
};
