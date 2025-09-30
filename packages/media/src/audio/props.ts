import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';

export type FallbackHtml5AudioProps = {
	offthreadAudioProps: {
		playbackRate?: number;
		muted?: boolean;
		loop?: boolean;
	};
};

export type AudioProps = {
	src: string;
	trimBefore?: number;
	trimAfter?: number;
	volume?: VolumeProp;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	name?: string;
	pauseWhenBuffering?: boolean;
	showInTimeline?: boolean;
	playbackRate?: number;
	muted?: boolean;
	delayRenderRetries?: number;
	delayRenderTimeoutInMilliseconds?: number;
	style?: React.CSSProperties;
	/**
	 * @deprecated For internal use only
	 */
	stack?: string;
	logLevel?: LogLevel;
	loop?: boolean;
	_remotionInternalNativeLoopPassed?: boolean;
	fallbackHtml5AudioProps?: {
		onError?: (err: Error) => void;
		audioStreamIndex?: number;
		useWebAudioApi?: boolean;
		toneFrequency?: number;
		acceptableTimeShiftInSeconds?: number;
	};
};
