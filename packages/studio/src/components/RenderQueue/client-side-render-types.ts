import type {RenderStillOnWebImageFormat} from '@remotion/web-renderer';
import type {LogLevel} from 'remotion';

export type ClientRenderJobProgress = {
	renderedFrames: number;
	encodedFrames: number;
	totalFrames: number;
};

export type GetBlobCallback = () => Promise<Blob>;

export type ClientRenderMetadata = {
	width: number;
	height: number;
	sizeInBytes: number;
};

type ClientRenderJobDynamicStatus =
	| {status: 'idle'}
	| {status: 'running'; progress: ClientRenderJobProgress}
	| {status: 'done'; getBlob: GetBlobCallback; metadata: ClientRenderMetadata}
	| {status: 'cancelled'}
	| {
			status: 'failed';
			error: {message: string; stack: string | undefined};
	  };

type ClientRenderJobBase = {
	id: string;
	startedAt: number;
	compositionId: string;
	outName: string;
	inputProps: Record<string, unknown>;
	delayRenderTimeout: number;
	mediaCacheSizeInBytes: number | null;
	logLevel: LogLevel;
	licenseKey: string | null;
	scale: number;
};

export type ClientStillRenderJob = ClientRenderJobBase & {
	type: 'client-still';
	imageFormat: RenderStillOnWebImageFormat;
	frame: number;
} & ClientRenderJobDynamicStatus;

export type ClientVideoRenderJob = ClientRenderJobBase & {
	type: 'client-video';
	container: string;
	videoCodec: string;
	audioCodec: string;
	startFrame: number;
	endFrame: number;
	audioBitrate: string;
	videoBitrate: string;
	hardwareAcceleration: string;
	keyframeIntervalInSeconds: number;
	transparent: boolean;
	muted: boolean;
} & ClientRenderJobDynamicStatus;

export type ClientRenderJob = ClientStillRenderJob | ClientVideoRenderJob;
