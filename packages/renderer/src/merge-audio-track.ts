import path from 'node:path';
import type {DownloadMap} from './assets/download-map';
import {callFf} from './call-ffmpeg';
import {chunk} from './chunk';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {OUTPUT_FILTER_NAME} from './create-ffmpeg-merge-filter';
import {createSilentAudio} from './create-silent-audio';
import {deleteDirectory} from './delete-directory';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {pLimit} from './p-limit';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';
import {tmpDir} from './tmp-dir';
import {truthy} from './truthy';

type Options = {
	files: PreprocessedAudioTrack[];
	outName: string;
	downloadMap: DownloadMap;
	remotionRoot: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	onProgress: (progress: number) => void;
	fps: number;
	chunkLengthInSeconds: number;
};

const mergeAudioTrackUnlimited = async ({
	outName,
	files,
	downloadMap,
	remotionRoot,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
	onProgress,
	fps,
	chunkLengthInSeconds,
}: Options): Promise<void> => {
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			chunkLengthInSeconds,
			indent,
			logLevel,
			binariesDirectory,
			cancelSignal,
		});
		onProgress(1);
		return;
	}

	// Previously a bug: We cannot optimize for files.length === 1 because we need to pad the audio

	// In FFMPEG, the total number of left and right tracks that can be merged at one time is limited to 64
	if (files.length >= 32) {
		const chunked = chunk(files, 10);
		const tempPath = tmpDir('remotion-large-audio-mixing');

		try {
			const partialProgress = new Array(chunked.length).fill(0);
			let finalProgress = 0;

			const callProgress = () => {
				const totalProgress =
					partialProgress.reduce((a, b) => a + b, 0) / chunked.length;

				const combinedProgress = totalProgress * 0.8 + finalProgress * 0.2;
				onProgress(combinedProgress);
			};

			const chunkNames = await Promise.all(
				chunked.map(async (chunkFiles, i) => {
					const chunkOutname = path.join(tempPath, `chunk-${i}.wav`);
					await mergeAudioTrack({
						files: chunkFiles,
						chunkLengthInSeconds,
						outName: chunkOutname,
						downloadMap,
						remotionRoot,
						indent,
						logLevel,
						binariesDirectory,
						cancelSignal,
						onProgress: (progress) => {
							partialProgress[i] = progress;
							callProgress();
						},
						fps,
					});
					return chunkOutname;
				}),
			);

			await mergeAudioTrack({
				files: chunkNames.map((c) => ({
					filter: {
						pad_end: null,
						pad_start: null,
					},
					outName: c,
				})),
				outName,
				downloadMap,
				remotionRoot,
				indent,
				logLevel,
				binariesDirectory,
				cancelSignal,
				onProgress: (progress) => {
					finalProgress = progress;
					callProgress();
				},
				fps,
				chunkLengthInSeconds,
			});
			return;
		} finally {
			deleteDirectory(tempPath);
		}
	}

	const {
		complexFilterFlag: mergeFilter,
		cleanup,
		complexFilter,
	} = await createFfmpegComplexFilter({
		filters: files,
		downloadMap,
	});

	const args = [
		['-hide_banner'],
		...files.map((f) => ['-i', f.outName]),
		mergeFilter,
		['-c:a', 'pcm_s16le'],
		['-map', `[${OUTPUT_FILTER_NAME}]`],
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);

	Log.verbose(
		{indent, logLevel},
		`Merging audio tracks`,
		'Command:',
		`ffmpeg ${args.join(' ')}`,
		'Complex filter script:',
		complexFilter,
	);

	const task = callFf({
		bin: 'ffmpeg',
		args,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});

	task.stderr?.on('data', (data: Buffer) => {
		const utf8 = data.toString('utf8');
		const parsed = parseFfmpegProgress(utf8, fps);
		if (parsed !== undefined) {
			onProgress(parsed / (chunkLengthInSeconds * fps));
		}
	});

	await task;

	onProgress(1);
	cleanup();
};

// Must be at least 3 because recursively called twice in mergeAudioTrack
const limit = pLimit(3);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
