import type {
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

type VideoMattingJobCommon = {
	src: string;
	displayName: string;
	model: VideoMattingModel;
	videoBitrate: VideoMattingBitrate;
	outName: string;
	audio: 'keep' | 'none';
	target: {
		fileName: string;
		nodePath: SequencePropsSubscriptionKey;
	} | null;
};

export type AddVideoMattingJobParams = VideoMattingJobCommon;

export type VideoMattingJob = AddVideoMattingJobParams & {
	id: string;
	type: 'video-matting';
	startedAt: number;
} & VideoMattingJobStatus;

export const isVideoMattingJob = (job: {
	type: string;
}): job is VideoMattingJob => job.type === 'video-matting';
