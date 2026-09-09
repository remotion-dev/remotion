import type {
	WhisperWebGpuModel,
	WhisperWebGpuTask,
} from '@remotion/whisper-webgpu';

export type CaptionJobProgress = {
	message: string;
	value: number;
};

type CaptionJobStatus =
	| {status: 'idle'}
	| {status: 'running'; progress: CaptionJobProgress}
	| {status: 'done'; captionCount: number}
	| {
			status: 'failed';
			error: {message: string; stack: string | undefined};
	  };

export type AddCaptionJobParams = {
	src: string;
	displayName: string;
	audioStreamIndex: number | null;
	requestInit: Omit<RequestInit, 'signal'> | null;
	outName: string;
	model: WhisperWebGpuModel;
	language: string | null;
	task: WhisperWebGpuTask;
	chunkLengthInSeconds: number;
	strideLengthInSeconds: number;
	forceFullSequences: boolean;
	doSample: boolean;
	temperature: number;
	topK: number;
	repetitionPenalty: number;
	noRepeatNgramSize: number;
};

export type CaptionJob = AddCaptionJobParams & {
	id: string;
	type: 'caption';
	startedAt: number;
} & CaptionJobStatus;

export const isCaptionJob = (job: {type: string}): job is CaptionJob => {
	return job.type === 'caption';
};
