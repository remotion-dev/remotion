import type {RenderAssetInfo} from './assets/download-map';

export type RenderFramesOutput = {
	frameCount: number;
	assetsInfo: RenderAssetInfo;
};

export type OnStartData = {
	frameCount: number;
	parallelEncoding: boolean;
	resolvedConcurrency: number;
};
