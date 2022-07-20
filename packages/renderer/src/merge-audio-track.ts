import execa from 'execa';
import path from 'path';
import type {FfmpegExecutable} from 'remotion';
import {Internals} from 'remotion';
import {chunk} from './chunk';
import {convertToPcm} from './convert-to-pcm';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {createSilentAudio} from './create-silent-audio';
import {deleteDirectory} from './delete-directory';
import {pLimit} from './p-limit';
import {tmpDir} from './tmp-dir';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	files: string[];
	outName: string;
	numberOfSeconds: number;
};

const mergeAudioTrackUnlimited = async ({
	ffmpegExecutable,
	outName,
	files,
	numberOfSeconds,
}: Options): Promise<void> => {
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			ffmpegExecutable,
			numberOfSeconds,
		});
		return;
	}

	if (files.length === 1) {
		await convertToPcm({
			outName,
			ffmpegExecutable,
			input: files[0],
		});
		return;
	}

	// In FFMPEG, the total number of left and right tracks that can be merged at one time is limited to 64
	if (files.length >= 32) {
		const chunked = chunk(files, 10);
		const tempPath = tmpDir('remotion-large-audio-mixing');

		const chunkNames = await Promise.all(
			chunked.map(async (chunkFiles, i) => {
				const chunkOutname = path.join(tempPath, `chunk-${i}.wav`);
				await mergeAudioTrack({
					ffmpegExecutable,
					files: chunkFiles,
					numberOfSeconds,
					outName: chunkOutname,
				});
				return chunkOutname;
			})
		);

		await mergeAudioTrack({
			ffmpegExecutable,
			files: chunkNames,
			numberOfSeconds,
			outName,
		});
		await deleteDirectory(tempPath);
		return;
	}

	const {complexFilterFlag: mergeFilter, cleanup} =
		await createFfmpegComplexFilter(files.length);

	const args = [
		...files.map((f) => ['-i', f]),
		mergeFilter,
		['-c:a', 'pcm_s16le'],
		['-map', '[a]'],
		['-y', outName],
	]
		.filter(Internals.truthy)
		.flat(2);

	const task = execa(ffmpegExecutable ?? 'ffmpeg', args);

	await task;
	cleanup();
};

const limit = pLimit(2);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
