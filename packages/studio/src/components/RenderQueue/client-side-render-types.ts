import type {CompletedClientRender} from '@remotion/studio-shared';
import type {
	RenderStillOnWebImageFormat,
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
	WebRendererVideoCodec,
} from '@remotion/web-renderer';
import type {LogLevel} from 'remotion';

export type ClientRenderJobProgress = {
	renderedFrames: number;
	encodedFrames: number;
	totalFrames: number;
};

export type GetBlobCallback = () => Promise<Blob>;

type ClientRenderJobDynamicStatus =
	| {status: 'idle'}
	| {status: 'running'; progress: ClientRenderJobProgress}
	| {status: 'saving'}
	| {
			status: 'done';
			getBlob?: GetBlobCallback;
			metadata: CompletedClientRender['metadata'];
	  }
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
	container: WebRendererContainer;
	videoCodec: WebRendererVideoCodec;
	audioCodec: WebRendererAudioCodec;
	startFrame: number;
	endFrame: number;
	audioBitrate: WebRendererQuality;
	videoBitrate: WebRendererQuality;
	hardwareAcceleration: string;
	keyframeIntervalInSeconds: number;
	transparent: boolean;
	muted: boolean;
} & ClientRenderJobDynamicStatus;

export type RestoredClientRenderJob = CompletedClientRender & {
	status: 'done';
};

export type ClientRenderJob =
	| ClientStillRenderJob
	| ClientVideoRenderJob
	| RestoredClientRenderJob;

export const isRestoredClientJob = (
	job: ClientRenderJob,
): job is RestoredClientRenderJob => {
	return !('inputProps' in job);
};
