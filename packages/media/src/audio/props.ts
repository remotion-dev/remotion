import type {
	InteractiveBaseProps,
	LogLevel,
	LoopVolumeCurveBehavior,
	VolumeProp,
} from 'remotion';
import type {MediaOnError} from '../on-error';
import type {MediaRequestInit} from '../request-init';

export type FallbackHtml5AudioProps = {
	crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
	onError?: (err: Error) => void;
	useWebAudioApi?: boolean;
	acceptableTimeShiftInSeconds?: number;
	pauseWhenBuffering?: boolean;
	preservePitch?: boolean;
};

export type AudioProps = {
	src: string;
	trimBefore?: number;
	trimAfter?: number;
	volume?: VolumeProp;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
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
	onError?: MediaOnError;
	/**
	 * @deprecated Use `requestInit={{credentials: ...}}` instead. If both are
	 * passed, `requestInit.credentials` wins over this prop.
	 */
	credentials?: RequestCredentials;
	requestInit?: MediaRequestInit;
} & InteractiveBaseProps;
