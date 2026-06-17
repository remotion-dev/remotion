import type {TimelineLoopDisplay} from '../loop-display';
import type {WaveformVolume} from './draw-peaks';

export type AudioWaveformWorkerInitMessage = {
	readonly type: 'init';
	readonly canvas: OffscreenCanvas;
};

export type AudioWaveformWorkerRenderMessage = {
	readonly type: 'render';
	readonly requestId: number;
	readonly src: string;
	readonly width: number;
	readonly height: number;
	readonly volume: WaveformVolume;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly playbackRate: number;
	readonly loopDisplay: TimelineLoopDisplay | undefined;
};

export type AudioWaveformWorkerDisposeMessage = {
	readonly type: 'dispose';
};

export type AudioWaveformWorkerIncomingMessage =
	| AudioWaveformWorkerInitMessage
	| AudioWaveformWorkerRenderMessage
	| AudioWaveformWorkerDisposeMessage;

export type AudioWaveformWorkerErrorMessage = {
	readonly type: 'error';
	readonly requestId: number;
	readonly message: string;
};

export type AudioWaveformWorkerOutgoingMessage =
	AudioWaveformWorkerErrorMessage;
