import {copyFileSync} from 'fs';
import path from 'path';
import type {DownloadMap} from './assets/download-map';
import {callFf} from './call-ffmpeg';
import {chunk} from './chunk';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {OUTPUT_FILTER_NAME} from './create-ffmpeg-merge-filter';
import {createSilentAudio} from './create-silent-audio';
import {deleteDirectory} from './delete-directory';
import {pLimit} from './p-limit';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';
import {tmpDir} from './tmp-dir';
import {truthy} from './truthy';

type Options = {
	files: PreprocessedAudioTrack[];
	outName: string;
	numberOfSeconds: number;
	downloadMap: DownloadMap;
	remotionRoot: string;
};

const mergeAudioTrackUnlimited = async ({
	outName,
	files,
	numberOfSeconds,
	downloadMap,
	remotionRoot,
}: Options): Promise<void> => {
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			numberOfSeconds,
		});
		return;
	}

	if (files.length === 1) {
		copyFileSync(files[0].outName, outName);
		return;
	}

	// In FFMPEG, the total number of left and right tracks that can be merged at one time is limited to 64
	if (files.length >= 32) {
		const chunked = chunk(files, 10);
		const tempPath = tmpDir('remotion-large-audio-mixing');

		try {
			const chunkNames = await Promise.all(
				chunked.map(async (chunkFiles, i) => {
					const chunkOutname = path.join(tempPath, `chunk-${i}.wav`);
					await mergeAudioTrack({
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
				files: chunkNames.map((c) => ({
					filter: {
						pad_end: null,
						pad_start: null,
					},
					outName: c,
				})),
				numberOfSeconds,
				outName,
				downloadMap,
				remotionRoot,
			});
			return;
		} finally {
			deleteDirectory(tempPath);
		}
	}

	const {complexFilterFlag: mergeFilter, cleanup} =
		await createFfmpegComplexFilter({
			filters: files,
			downloadMap,
		});

	const args = [
		...files.map((f) => ['-i', f.outName]),
		mergeFilter,
		['-c:a', 'pcm_s16le'],
		['-map', `[${OUTPUT_FILTER_NAME}]`],
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);
	const task = callFf('ffmpeg', args);
	await task;
	cleanup();
};

// Must be at least 3 because recursively called twice in mergeAudioTrack
const limit = pLimit(3);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
