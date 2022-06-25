import type {RenderAssetInfo} from 'remotion';

export type RenderFramesOutput = {
	frameCount: number;
	assetsInfo: RenderAssetInfo;
};

export type OnStartData = {
	frameCount: number;
};
