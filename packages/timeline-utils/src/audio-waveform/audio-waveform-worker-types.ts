export type AudioWaveformWorkerLoadMessage = {
	readonly type: 'load';
	readonly requestId: number;
	readonly src: string;
	readonly waveformSampleRate: number;
};

export type AudioWaveformWorkerIncomingMessage = AudioWaveformWorkerLoadMessage;

export type AudioWaveformWorkerPeaksMessage = {
	readonly type: 'peaks';
	readonly requestId: number;
	readonly peaks: Float32Array;
	readonly final: boolean;
};

export type AudioWaveformWorkerErrorMessage = {
	readonly type: 'error';
	readonly requestId: number;
	readonly message: string;
};

export type AudioWaveformWorkerOutgoingMessage =
	| AudioWaveformWorkerPeaksMessage
	| AudioWaveformWorkerErrorMessage;
