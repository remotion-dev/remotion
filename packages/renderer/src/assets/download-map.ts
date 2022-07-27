import type {TAsset} from 'remotion';

type EncodingStatus =
	| {
			type: 'encoding';
	  }
	| {
			type: 'done';
			src: string;
	  }
	| undefined;

export type DownloadMap = {
	isDownloadingMap: {
		[src: string]:
			| {
					[downloadDir: string]: boolean;
			  }
			| undefined;
	};
	hasBeenDownloadedMap: {
		[src: string]:
			| {
					[downloadDir: string]: string | null;
			  }
			| undefined;
	};
	listeners: {[key: string]: {[downloadDir: string]: (() => void)[]}};
	lastFrameMap: Record<string, {lastAccessed: number; data: Buffer}>;
	isBeyondLastFrameMap: Record<string, number>;

	ensureFileHasPresentationTimestamp: Record<string, EncodingStatus>;
};

export type RenderAssetInfo = {
	assets: TAsset[][];
	imageSequenceName: string;
	downloadDir: string;
	firstFrameIndex: number;
	downloadMap: DownloadMap;
};

export const makeDownloadMap = (): DownloadMap => {
	return {
		isDownloadingMap: {},
		hasBeenDownloadedMap: {},
		listeners: {},
		lastFrameMap: {},
		isBeyondLastFrameMap: {},
		ensureFileHasPresentationTimestamp: {},
	};
};
