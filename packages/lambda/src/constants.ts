export const REGION = 'eu-central-1';
export const RENDERS_BUCKET_PREFIX = 'remotion-renders-';
export const LAMBDA_BUCKET_PREFIX = 'remotion-bucket-';
export const REMOTION_RENDER_FN_ZIP = 'remotion-render-function-';
export const REMOTION_STITCHER_FN_ZIP = 'remotion-stitcher-function-';
export const RENDER_FN_PREFIX = 'remotion-render-test-';
export const RENDER_STITCHER_PREFIX = 'remotion-stitcher-test-';
export const EFS_MOUNT_PATH = '/mnt/efs';
export const ENABLE_EFS = false;
export const ENCODING_PROGRESS_KEY = 'encoding-progress.json';
export const RENDER_METADATA_KEY = 'render-metadata.json';
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
		// Just for debugging
		durationInFrames: number;
	};
	launch: {
		type: LambdaRoutines.launch;
		serveUrl: string;
		composition: string;
		chunkSize: number;
		// Just for debugging
		durationInFrames: number;
		bucketName: string;
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
		efsRemotionVideoPath: string;
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
};
