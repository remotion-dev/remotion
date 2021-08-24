import {RenderAssetInfo} from 'remotion';

export type RenderFramesOutput = {
	frameCount: number;
	assetsInfo: RenderAssetInfo;
};

export type OnStartData = {
	frameCount: number;
};

export type OnErrorInfo = {error: Error; frame: number | null};
