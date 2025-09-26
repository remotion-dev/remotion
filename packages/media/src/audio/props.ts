import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';

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
};
