import fs, {mkdirSync} from 'node:fs';
import path from 'node:path';
import type {TRenderAsset} from 'remotion/no-react';
import {deleteDirectory} from '../delete-directory';
import {OffthreadVideoServerEmitter} from '../offthread-video-server';
import {tmpDir} from '../tmp-dir';
import type {RenderMediaOnDownload} from './download-and-map-assets-to-file';

export type AudioChannelsAndDurationResultCache = {
	channels: number;
	duration: number | null;
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
	compositorCache: {[key: string]: string};
};

export type RenderAssetInfo = {
	assets: TRenderAsset[][];
	imageSequenceName: string;
	firstFrameIndex: number;
	downloadMap: DownloadMap;
};

const makeAndReturn = (dir: string, name: string) => {
	const p = path.join(dir, name);
	mkdirSync(p);
	return p;
};

const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');

const packageJson = fs.existsSync(packageJsonPath)
	? JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
	: null;

export const makeDownloadMap = (): DownloadMap => {
	const dir = tmpDir(
		packageJson
			? `remotion-v${packageJson.version.replace(/\./g, '-')}-assets`
			: 'remotion-assets',
	);

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
		compositorCache: {},
		emitter: new OffthreadVideoServerEmitter(),
	};
};

export const cleanDownloadMap = (downloadMap: DownloadMap) => {
	deleteDirectory(downloadMap.downloadDir);
	deleteDirectory(downloadMap.complexFilter);
	deleteDirectory(downloadMap.compositingDir);
	// Assets dir must be last since the others are contained
	deleteDirectory(downloadMap.assetDir);
};
