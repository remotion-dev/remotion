import type {
	VideoLayerAudio,
	VideoMattingBitrate,
	VideoMattingModel,
} from '@remotion/video-matting';
import type {SequencePropsSubscriptionKey} from 'remotion';

export type VideoMattingJobProgress = {
	detail: string | null;
	message: string;
	value: number;
};

type VideoMattingJobStatus =
	| {status: 'idle'}
	| {status: 'cancelled'}
	| {status: 'running' | 'saving'; progress: VideoMattingJobProgress}
	| {status: 'done'}
	| {status: 'failed'; error: {message: string; stack: string | undefined}};

export type AddVideoMattingJobParams = {
	src: string;
	displayName: string;
	baseOutName: string;
	foregroundOutName: string;
	model: VideoMattingModel;
	audio: VideoLayerAudio;
	videoBitrate: VideoMattingBitrate;
	target: {
		fileName: string;
		nodePath: SequencePropsSubscriptionKey;
	} | null;
};

export type VideoMattingJob = AddVideoMattingJobParams & {
	id: string;
	type: 'video-matting';
	startedAt: number;
} & VideoMattingJobStatus;

export const isVideoMattingJob = (job: {
	type: string;
}): job is VideoMattingJob => job.type === 'video-matting';
