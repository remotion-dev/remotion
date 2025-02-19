import path from 'path';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Assets} from './assets/types';
import {compressAudio} from './compress-audio';
import {deleteDirectory} from './delete-directory';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {mergeAudioTrack} from './merge-audio-track';
import type {AudioCodec} from './options/audio-codec';
import {getExtensionFromAudioCodec} from './options/audio-codec';
import {preprocessAudioTrack} from './preprocess-audio-track';
import type {FrameAndAssets} from './render-frames';
import {truthy} from './truthy';

export type SeamlessAudioInfo = {
	chunkLengthInSeconds: number;
	trimLeftOffset: number;
	trimRightOffset: number;
};

export const createAudio = async ({
	assets,
	onDownload,
	fps,
	logLevel,
	onProgress,
	downloadMap,
	remotionRoot,
	indent,
	binariesDirectory,
	audioBitrate,
	audioCodec,
	cancelSignal,
	chunkLengthInSeconds,
	trimLeftOffset,
	trimRightOffset,
	forSeamlessAacConcatenation,
}: {
	assets: FrameAndAssets[];
	onDownload: RenderMediaOnDownload | undefined;
	fps: number;
	logLevel: LogLevel;
	onProgress: (progress: number) => void;
	downloadMap: DownloadMap;
	remotionRoot: string;
	indent: boolean;
	binariesDirectory: string | null;
	audioBitrate: string | null;
	audioCodec: AudioCodec;
	cancelSignal: CancelSignal | undefined;
	chunkLengthInSeconds: number;
	trimLeftOffset: number;
	trimRightOffset: number;
	forSeamlessAacConcatenation: boolean;
}): Promise<string> => {
	const fileUrlAssets = await convertAssetsToFileUrls({
		assets,
		onDownload: onDownload ?? (() => () => undefined),
		downloadMap,
		indent,
		logLevel,
		binariesDirectory,
	});

	markAllAssetsAsDownloaded(downloadMap);
	const assetPositions: Assets = calculateAssetPositions(fileUrlAssets);

	Log.verbose(
		{indent, logLevel, tag: 'audio'},
		'asset positions',
		JSON.stringify(assetPositions),
	);

	const preprocessProgress = new Array(assetPositions.length).fill(0);
	let mergeProgress = 0;
	let compressProgress = 0;

	const updateProgress = () => {
		const preprocessProgressSum =
			preprocessProgress.length === 0
				? 1
				: preprocessProgress.reduce((a, b) => a + b, 0) / assetPositions.length;

		const totalProgress =
			preprocessProgressSum * 0.7 +
			mergeProgress * 0.1 +
			compressProgress * 0.2;

		onProgress(totalProgress);
	};

	const audioTracks = await Promise.all(
		assetPositions.map(async (asset, index) => {
			const filterFile = path.join(downloadMap.audioMixing, `${index}.wav`);
			const result = await preprocessAudioTrack({
				outName: filterFile,
				asset,
				fps,
				downloadMap,
				indent,
				logLevel,
				binariesDirectory,
				cancelSignal,
				onProgress: (progress) => {
					preprocessProgress[index] = progress;
					updateProgress();
				},
				chunkLengthInSeconds,
				trimLeftOffset,
				trimRightOffset,
				forSeamlessAacConcatenation,
			});
			preprocessProgress[index] = 1;
			updateProgress();
			return result;
		}),
	);

	const preprocessed = audioTracks.filter(truthy);
	const merged = path.join(downloadMap.audioPreprocessing, 'merged.wav');
	const extension = getExtensionFromAudioCodec(audioCodec);
	const outName = path.join(
		downloadMap.audioPreprocessing,
		`audio.${extension}`,
	);

	await mergeAudioTrack({
		files: preprocessed,
		outName: merged,
		downloadMap,
		remotionRoot,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
		fps,
		onProgress: (progress) => {
			mergeProgress = progress;
			updateProgress();
		},
		chunkLengthInSeconds,
	});

	await compressAudio({
		audioBitrate,
		audioCodec,
		binariesDirectory,
		indent,
		logLevel,
		inName: merged,
		outName,
		cancelSignal,
		chunkLengthInSeconds,
		fps,
		onProgress: (progress) => {
			compressProgress = progress;
			updateProgress();
		},
	});

	deleteDirectory(merged);
	deleteDirectory(downloadMap.audioMixing);

	preprocessed.forEach((p) => {
		deleteDirectory(p.outName);
	});

	return outName;
};
