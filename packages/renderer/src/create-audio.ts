import path from 'path';
import type {TRenderAsset} from 'remotion/no-react';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Assets} from './assets/types';
import {deleteDirectory} from './delete-directory';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {mergeAudioTrack} from './merge-audio-track';
import {preprocessAudioTrack} from './preprocess-audio-track';
import {truthy} from './truthy';

export const getAssetsData = async ({
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
	forceLossless,
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
	forceLossless: boolean;
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

	const preprocessed = (
		await Promise.all(
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
				});
				preprocessProgress[index] = 1;
				updateProgress();
				return result;
			}),
		)
	).filter(truthy);

	const outName = path.join(downloadMap.audioPreprocessing, `audio.wav`);

	await mergeAudioTrack({
		files: preprocessed,
		outName,
		numberOfSeconds: Number((expectedFrames / fps).toFixed(3)),
		downloadMap,
		remotionRoot,
		indent,
		logLevel,
		binariesDirectory,
		forceLossless,
	});

	onProgress(1);

	deleteDirectory(downloadMap.audioMixing);
	preprocessed.forEach((p) => {
		deleteDirectory(p.outName);
	});

	return outName;
};
