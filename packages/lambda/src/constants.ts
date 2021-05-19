import {AwsRegion} from './pricing/aws-regions';

export const MEMORY_SIZE = 2048;
export const REGION: AwsRegion = 'eu-central-1';
export const RENDERS_BUCKET_PREFIX = 'remotion-renders-';
export const LAMBDA_S3_WEBSITE_DEPLOY = 'remotion-video-';
export const RENDER_FN_PREFIX = 'remotion-render-';
export const EFS_MOUNT_PATH = '/mnt/efs';
export const ENABLE_EFS = false;
export const ENCODING_PROGRESS_KEY = 'encoding-progress.json';
export const RENDER_METADATA_KEY = 'render-metadata.json';
export const LAMBDA_INITIALIZED_KEY = 'lambda-initialized';
export const OUT_NAME = 'out.mp4';

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
	};
	fire: {
		type: LambdaRoutines.fire;
		payloads: unknown[];
	};
	status: {
		type: LambdaRoutines.status;
		bucketName: string;
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
};
