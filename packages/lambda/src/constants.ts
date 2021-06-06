import {AwsRegion} from './pricing/aws-regions';

export const MEMORY_SIZE = 2048;
export const REGION: AwsRegion = 'eu-central-1';
// TODO: Rename other buckets in Jonnys accoudn first
export const REMOTION_BUCKET_PREFIX = 'remotionlambda-';
export const RENDER_FN_PREFIX = 'remotion-render-';
export const EFS_MOUNT_PATH = '/mnt/efs';
export const ENABLE_EFS = false;
export const encodingProgressKey = (renderId: string) =>
	`renders/${renderId}/encoding-progress.json`;
export const renderMetadataKey = (renderId: string) =>
	`renders/${renderId}/render-metadata.json`;
export const lambdaInitializedKey = (renderId: string) =>
	`renders/${renderId}/lambda-initialized`;
export const chunkKey = (renderId: string) =>
	`renders/${renderId}/chunks/chunk-`;
export const timingProfileName = (renderId: string) =>
	`renders/${renderId}/timing-profile`;
export const getStitcherErrorKeyPrefix = (renderId: string) =>
	`renders/${renderId}/errors/stitcher-`;
export const getRendererErrorKeyPrefix = (renderId: string) =>
	`renders/${renderId}/errors/renderer-`;
// TODO: Optimization profile per deploy
export const optimizationProfile = (compositionId: string) =>
	`optimization-profiles/${compositionId}/optimization-profile`;
export const getSitesKey = (siteId: string) => `sites/${siteId}`;
export const outName = (renderId: string) => `renders/${renderId}/out.mp4`;

export enum LambdaRoutines {
	start = 'start',
	launch = 'launch',
	status = 'status',
	fire = 'fire',
	renderer = 'renderer',
}

export type LambdaPayloads = {
	start: {
		type: LambdaRoutines.start;
		serveUrl: string;
		composition: string;
		chunkSize: number;
		inputProps: unknown;
	};
	launch: {
		type: LambdaRoutines.launch;
		serveUrl: string;
		composition: string;
		chunkSize: number;
		bucketName: string;
		inputProps: unknown;
		renderId: string;
	};
	fire: {
		type: LambdaRoutines.fire;
		payloads: unknown[];
		renderId: string;
	};
	status: {
		type: LambdaRoutines.status;
		bucketName: string;
		renderId: string;
	};
	renderer: {
		type: LambdaRoutines.renderer;
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
		inputProps: unknown;
		renderId: string;
	};
};

export type LambdaPayload = LambdaPayloads[LambdaRoutines];

export type EncodingProgress = {
	framesRendered: number;
};

export type RenderMetadata = {
	totalFrames: number;
	startedDate: number;
	totalChunks: number;
	estimatedLambdaInvokations: number;
	compositionId: string;
};
