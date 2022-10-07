import fs, {mkdirSync} from 'fs';
import path from 'path';
import type {TAsset, TCaption} from 'remotion';
import {deleteDirectory} from '../delete-directory';
import {tmpDir} from '../tmp-dir';

type EncodingStatus =
	| {
			type: 'encoding';
	  }
	| {
			type: 'done';
			src: string;
	  }
	| undefined;

export type SpecialVCodecForTransparency = 'vp9' | 'vp8' | 'none';

export type Vp9Result = {
	specialVcodec: SpecialVCodecForTransparency;
	needsResize: [number, number] | null;
};
export type VideoDurationResult = {
	duration: number | null;
	fps: number | null;
};

export type AudioChannelsAndDurationResultCache = {
	channels: number;
	duration: number | null;
};

export type DownloadMap = {
	id: string;
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
	isVp9VideoCache: Record<string, Vp9Result>;
	ensureFileHasPresentationTimestamp: Record<string, EncodingStatus>;
	videoDurationResultCache: Record<string, VideoDurationResult>;
	durationOfAssetCache: Record<string, AudioChannelsAndDurationResultCache>;
	downloadDir: string;
	preEncode: string;
	audioMixing: string;
	complexFilter: string;
	audioPreprocessing: string;
	stitchFrames: string;
	assetDir: string;
};

export type RenderAssetInfo = {
	assets: TAsset[][];
	captions: TCaption[][];
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
			: 'remotion-assets'
	);

	return {
		isDownloadingMap: {},
		hasBeenDownloadedMap: {},
		listeners: {},
		lastFrameMap: {},
		isBeyondLastFrameMap: {},
		ensureFileHasPresentationTimestamp: {},
		isVp9VideoCache: {},
		videoDurationResultCache: {},
		durationOfAssetCache: {},
		id: String(Math.random()),
		assetDir: dir,
		downloadDir: makeAndReturn(dir, 'remotion-assets-dir'),
		complexFilter: makeAndReturn(dir, 'remotion-complex-filter'),
		preEncode: makeAndReturn(dir, 'pre-encode'),
		audioMixing: makeAndReturn(dir, 'remotion-audio-mixing'),
		audioPreprocessing: makeAndReturn(dir, 'remotion-audio-preprocessing'),
		stitchFrames: makeAndReturn(dir, 'remotion-stitch-temp-dir'),
	};
};

export const cleanDownloadMap = async (downloadMap: DownloadMap) => {
	await deleteDirectory(downloadMap.downloadDir);
	await deleteDirectory(downloadMap.complexFilter);
	await deleteDirectory(downloadMap.assetDir);
};
