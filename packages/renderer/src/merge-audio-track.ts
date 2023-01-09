import execa from 'execa';
import path from 'path';
import type {DownloadMap} from './assets/download-map';
import {chunk} from './chunk';
import {convertToPcm} from './convert-to-pcm';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {createSilentAudio} from './create-silent-audio';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableBinary} from './ffmpeg-flags';
import {pLimit} from './p-limit';
import {truthy} from './truthy';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	files: string[];
	outName: string;
	numberOfSeconds: number;
	downloadMap: DownloadMap;
	remotionRoot: string;
};

const mergeAudioTrackUnlimited = async ({
	ffmpegExecutable,
	outName,
	files,
	numberOfSeconds,
	downloadMap,
	remotionRoot,
}: Options): Promise<void> => {
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			ffmpegExecutable,
			numberOfSeconds,
			remotionRoot,
		});
		return;
	}

	if (files.length === 1) {
		await convertToPcm({
			outName,
			ffmpegExecutable,
			input: files[0],
			remotionRoot,
		});
		return;
	}

	// In FFMPEG, the total number of left and right tracks that can be merged at one time is limited to 64
	if (files.length >= 32) {
		const chunked = chunk(files, 10);

		const chunkNames = await Promise.all(
			chunked.map(async (chunkFiles) => {
				const chunkOutname = path.join(
					downloadMap.largeAudioMixing,
					`chunk-${Math.random().toString().replace('0.', '')}.wav`
				);
				await mergeAudioTrack({
					ffmpegExecutable,
					files: chunkFiles,
					numberOfSeconds,
					outName: chunkOutname,
					downloadMap,
					remotionRoot,
				});
				return chunkOutname;
			})
		);

		await mergeAudioTrack({
			ffmpegExecutable,
			files: chunkNames,
			numberOfSeconds,
			outName,
			downloadMap,
			remotionRoot,
		});
		return;
	}

	const {complexFilterFlag, cleanup} = await createFfmpegComplexFilter(
		files.length,
		downloadMap
	);

	const args = [
		...files.map((f) => ['-i', f]),
		complexFilterFlag,
		['-c:a', 'pcm_s16le'],
		['-map', '[a]'],
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);
	await execa(
		await getExecutableBinary(ffmpegExecutable, remotionRoot, 'ffmpeg'),
		args
	);
	cleanup();
};

// Must be at least 3 because recursively called twice in mergeAudioTrack
const limit = pLimit(3);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
