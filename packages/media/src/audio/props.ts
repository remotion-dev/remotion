import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';

export type FallbackHtml5AudioProps = {
	onError?: (err: Error) => void;
	useWebAudioApi?: boolean;
	acceptableTimeShiftInSeconds?: number;
	delayRenderRetries?: number;
	delayRenderTimeoutInMilliseconds?: number;
	pauseWhenBuffering?: boolean;
};

export type AudioProps = {
	src: string;
	trimBefore?: number;
	trimAfter?: number;
	volume?: VolumeProp;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	name?: string;
	showInTimeline?: boolean;
	playbackRate?: number;
	muted?: boolean;
	style?: React.CSSProperties;
	/**
	 * @deprecated For internal use only
	 */
	stack?: string;
	logLevel?: LogLevel;
	loop?: boolean;
	audioStreamIndex?: number;
	_remotionInternalNativeLoopPassed?: boolean;
	fallbackHtml5AudioProps?: FallbackHtml5AudioProps;
	disallowFallbackToHtml5Audio?: boolean;
	toneFrequency?: number;
};
