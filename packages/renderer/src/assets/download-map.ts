import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {deleteDirectory} from '../delete-directory';
import {OffthreadVideoServerEmitter} from '../offthread-video-server';
import type {FrameAndAssets} from '../render-frames';
import {tmpDir} from '../tmp-dir';
import type {RenderMediaOnDownload} from './download-and-map-assets-to-file';
import {
	makeInlineAudioMixing,
	type InlineAudioMixing,
} from './inline-audio-mixing';

export type AudioChannelsAndDurationResultCache = {
	channels: number;
	duration: number | null;
	startTime: number | null;
};

export type DownloadMap = {
	id: string;
	emitter: OffthreadVideoServerEmitter;
	downloadListeners: RenderMediaOnDownload[];
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
	durationOfAssetCache: Record<string, AudioChannelsAndDurationResultCache>;
	downloadDir: string;
	preEncode: string;
	audioMixing: string;
	complexFilter: string;
	audioPreprocessing: string;
	stitchFrames: string;
	assetDir: string;
	compositingDir: string;
	preventCleanup: () => void;
	allowCleanup: () => void;
	isPreventedFromCleanup: () => boolean;
	inlineAudioMixing: InlineAudioMixing;
};

export type RenderAssetInfo = {
	assets: FrameAndAssets[];
	imageSequenceName: string;
	firstFrameIndex: number;
	downloadMap: DownloadMap;
	chunkLengthInSeconds: number;
	trimLeftOffset: number;
	trimRightOffset: number;
	forSeamlessAacConcatenation: boolean;
};

export const makeAndReturn = (dir: string, name: string) => {
	const p = path.join(dir, name);
	mkdirSync(p);
	return p;
};

export const makeDownloadMap = (): DownloadMap => {
	const dir = tmpDir(`remotion-v${VERSION}-assets`);

	let prevented = false;

	return {
		isDownloadingMap: {},
		hasBeenDownloadedMap: {},
		listeners: {},
		durationOfAssetCache: {},
		id: String(Math.random()),
		assetDir: dir,
		downloadListeners: [],
		downloadDir: makeAndReturn(dir, 'remotion-assets-dir'),
		complexFilter: makeAndReturn(dir, 'remotion-complex-filter'),
		preEncode: makeAndReturn(dir, 'pre-encode'),
		audioMixing: makeAndReturn(dir, 'remotion-audio-mixing'),
		audioPreprocessing: makeAndReturn(dir, 'remotion-audio-preprocessing'),
		stitchFrames: makeAndReturn(dir, 'remotion-stitch-temp-dir'),
		compositingDir: makeAndReturn(dir, 'remotion-compositing-temp-dir'),
		emitter: new OffthreadVideoServerEmitter(),
		preventCleanup: () => {
			prevented = true;
		},
		allowCleanup: () => {
			prevented = false;
		},
		isPreventedFromCleanup: () => {
			return prevented;
		},
		inlineAudioMixing: makeInlineAudioMixing(dir),
	};
};

export const cleanDownloadMap = (downloadMap: DownloadMap) => {
	if (downloadMap.isPreventedFromCleanup()) {
		return;
	}

	deleteDirectory(downloadMap.downloadDir);
	deleteDirectory(downloadMap.complexFilter);
	deleteDirectory(downloadMap.compositingDir);

	downloadMap.inlineAudioMixing.cleanup();

	// Assets dir must be last since the others are contained
	deleteDirectory(downloadMap.assetDir);
};
