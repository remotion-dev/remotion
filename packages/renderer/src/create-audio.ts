import path from 'path';
import type {TRenderAsset} from 'remotion/no-react';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Assets} from './assets/types';
import type {AudioCodec} from './audio-codec';
import {compressAudio} from './compress-audio';
import {deleteDirectory} from './delete-directory';
import {getExtensionFromAudioCodec} from './get-extension-from-audio-codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {mergeAudioTrack} from './merge-audio-track';
import {preprocessAudioTrack} from './preprocess-audio-track';
import {truthy} from './truthy';

export const createAudio = async ({
	assets,
	onDownload,
	fps,
	expectedFrames,
	logLevel,
	onProgress,
	downloadMap,
	remotionRoot,
	indent,
	binariesDirectory,
	audioBitrate,
	audioCodec,
	cancelSignal,
}: {
	assets: TRenderAsset[][];
	onDownload: RenderMediaOnDownload | undefined;
	fps: number;
	expectedFrames: number;
	logLevel: LogLevel;
	onProgress: (progress: number) => void;
	downloadMap: DownloadMap;
	remotionRoot: string;
	indent: boolean;
	binariesDirectory: string | null;
	audioBitrate: string | null;
	audioCodec: AudioCodec;
	cancelSignal: CancelSignal | undefined;
}): Promise<string> => {
	const fileUrlAssets = await convertAssetsToFileUrls({
		assets,
		onDownload: onDownload ?? (() => () => undefined),
		downloadMap,
		indent,
		logLevel,
	});

	markAllAssetsAsDownloaded(downloadMap);
	const assetPositions: Assets = calculateAssetPositions(fileUrlAssets);

	Log.verbose(
		{indent, logLevel, tag: 'audio'},
		'asset positions',
		JSON.stringify(assetPositions),
	);

	const preprocessProgress = new Array(assetPositions.length).fill(0);

	const updateProgress = () => {
		onProgress(
			preprocessProgress.reduce((a, b) => a + b, 0) / assetPositions.length,
		);
	};

	const audioTracks = await Promise.all(
		assetPositions.map(async (asset, index) => {
			const filterFile = path.join(downloadMap.audioMixing, `${index}.wav`);
			const result = await preprocessAudioTrack({
				outName: filterFile,
				asset,
				expectedFrames,
				fps,
				downloadMap,
				indent,
				logLevel,
				binariesDirectory,
				cancelSignal,
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
		numberOfSeconds: Number((expectedFrames / fps).toFixed(3)),
		downloadMap,
		remotionRoot,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
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
	});

	// TODO: Handle new progress
	onProgress(1);

	deleteDirectory(merged);
	deleteDirectory(downloadMap.audioMixing);

	preprocessed.forEach((p) => {
		deleteDirectory(p.outName);
	});

	return outName;
};
