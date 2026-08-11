import type {AudioOrVideoAsset} from 'remotion/no-react';
import type {LogLevel} from '../log-level';
import type {FrameAndAssets} from '../render-frames';
import type {RenderMediaOnDownload} from './download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './download-and-map-assets-to-file';
import type {DownloadMap} from './download-map';

const chunk = <T>(input: T[], size: number) => {
	return input.reduce<T[][]>((arr, item, idx) => {
		return idx % size === 0
			? [...arr, [item]]
			: [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
	}, []);
};

export const convertAssetsToFileUrls = async ({
	assets,
	onDownload,
	downloadMap,
	indent,
	logLevel,
	binariesDirectory,
}: {
	assets: FrameAndAssets[];
	onDownload: RenderMediaOnDownload;
	downloadMap: DownloadMap;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
}): Promise<AudioOrVideoAsset[][]> => {
	const chunks = chunk(assets, 1000);
	const results: AudioOrVideoAsset[][][] = [];

	for (const ch of chunks) {
		const assetPromises = ch.map((frame) => {
			const frameAssetPromises = frame.audioAndVideoAssets.map((a) => {
				return downloadAndMapAssetsToFileUrl({
					renderAsset: a,
					onDownload,
					downloadMap,
					indent,
					logLevel,
					binariesDirectory,
					cancelSignalForAudioAnalysis: undefined,
					shouldAnalyzeAudioImmediately: true,
				});
			});
			return Promise.all(frameAssetPromises);
		});
		const result = await Promise.all(assetPromises);
		results.push(result);
	}

	return results.flat(1);
};
