import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	VolumeProp,
} from 'remotion';

export type FallbackOffthreadVideoProps = {
	acceptableTimeShiftInSeconds?: number;
	transparent?: boolean;
	toneMapped?: boolean;
	audioStreamIndex?: number;
	onError?: (err: Error) => void;
	toneFrequency?: number;
};

export type VideoProps = {
	src: string;
	className?: string;
	trimBefore?: number;
	trimAfter?: number;
	volume?: VolumeProp;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	name?: string;
	pauseWhenBuffering?: boolean;
	showInTimeline?: boolean;
	onVideoFrame?: OnVideoFrame;
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
	fallbackOffthreadVideoProps?: FallbackOffthreadVideoProps;
};
