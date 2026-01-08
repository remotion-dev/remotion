import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';

export type MediaErrorAction = 'fallback' | 'fail';

export type MediaErrorEvent = {
	error: Error;
};

export type FallbackHtml5AudioProps = {
	crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
	onError?: (err: Error) => void;
	useWebAudioApi?: boolean;
	acceptableTimeShiftInSeconds?: number;
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
	delayRenderRetries?: number;
	delayRenderTimeoutInMilliseconds?: number;
	onError?: (event: MediaErrorEvent) => MediaErrorAction;
};
