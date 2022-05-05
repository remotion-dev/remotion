import execa from 'execa';
import fs from 'fs';
import {Codec, FfmpegExecutable, Internals} from 'remotion';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {createSilentAudio} from './create-silent-audio';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	files: string[];
	outName: string;
	audioCodec: Codec;
	numberOfSeconds: number;
};

export const mergeAudioTrack = async ({
	ffmpegExecutable,
	outName,
	files,
	audioCodec,
	numberOfSeconds,
}: Options) => {
	const {complexFilterFlag: mergeFilter, cleanup} =
		await createFfmpegComplexFilter(files.length);

	if (files.length === 0) {
		await createSilentAudio({
			outName,
			audioCodec,
			ffmpegExecutable,
			numberOfSeconds,
		});
		return;
	}

	if (files.length === 1) {
		await fs.promises.copyFile(files[0], outName);
		return;
	}

	const args = [
		...files.map((f) => ['-i', f]),
		mergeFilter,
		['-map', '[a]'],
		['-y', outName],
	]
		.filter(Internals.truthy)
		.flat(2);

	const task = execa(ffmpegExecutable ?? 'ffmpeg', args);

	await task;
	cleanup();
};
