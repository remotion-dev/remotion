import type {
	ChromiumOptions,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type {GcpRegion} from '../pricing/gcp-regions';
import type {CloudrunCodec} from './validate-gcp-codec';

export const DEFAULT_REGION: GcpRegion = 'us-east1';
export const BINARY_NAME = 'remotion cloudrun';

export const REMOTION_BUCKET_PREFIX = 'remotioncloudrun-';
export const RENDER_SERVICE_PREFIX = 'remotion';

export const getSitesKey = (siteId: string) => `sites/${siteId}`;

export const DEFAULT_MAX_RETRIES = 1;

export const inputPropsKey = (hash: string) => {
	return `input-props/${hash}.json`;
};

export type Privacy = 'public' | 'private';
export const DEFAULT_OUTPUT_PRIVACY: Privacy = 'public';

export enum CloudrunRoutines {
	info = 'info',
	media = 'media',
	still = 'still',
}

export type DownloadBehavior =
	| {
			type: 'play-in-browser';
	  }
	| {
			type: 'download';
			fileName: string | null;
	  };

export type CloudrunPayloads = {
	info: {
		type: CloudrunRoutines.info;
	};
	media: {
		concurrencyPerLambda: number;
		type: CloudrunRoutines.media;
		serveUrl: string;
		frameRange: [number, number];
		chunk: number;
		bucketName: string;
		composition: string;
		fps: number;
		height: number;
		width: number;
		durationInFrames: number;
		retriesLeft: number;
		inputProps: string;
		renderId: string;
		imageFormat: VideoImageFormat;
		codec: CloudrunCodec;
		crf: number | undefined;
		proResProfile: ProResProfile | undefined;
		pixelFormat: PixelFormat | undefined;
		jpegQuality: number | undefined;
		envVariables: Record<string, string> | undefined;
		privacy: Privacy;
		attempt: number;
		timeoutInMilliseconds: number;
		chromiumOptions: ChromiumOptions;
		scale: number;
		everyNthFrame: number;
		muted: boolean;
		audioBitrate: string | null;
		videoBitrate: string | null;
		launchFunctionConfig: {
			version: string;
		};
	};
	still: {
		type: CloudrunRoutines.still;
		serveUrl: string;
		composition: string;
		inputProps: string;
		imageFormat: StillImageFormat;
		envVariables: Record<string, string> | undefined;
		attempt: number;
		jpegQuality: number | undefined;
		maxRetries: number;
		frame: number;
		privacy: Privacy;
		outName: string;
		timeoutInMilliseconds: number;
		chromiumOptions: ChromiumOptions;
		scale: number;
		downloadBehavior: DownloadBehavior | null;
		version: string;
		forceHeight: number | null;
		forceWidth: number | null;
		bucketName: string | null;
	};
};

export type CloudrunPayload = CloudrunPayloads[CloudrunRoutines];
