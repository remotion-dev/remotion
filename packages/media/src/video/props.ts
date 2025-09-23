import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	VolumeProp,
} from 'remotion';

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
	onAutoPlayError?: null | (() => void);
	onVideoFrame?: OnVideoFrame;
	playbackRate?: number;
	muted?: boolean;
	delayRenderRetries?: number;
	delayRenderTimeoutInMilliseconds?: number;
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
	style?: React.CSSProperties;
	onError?: (err: Error) => void;
	useWebAudioApi?: boolean;
	acceptableTimeShiftInSeconds?: number;
	/**
	 * @deprecated For internal use only
	 */
	stack?: string;
	logLevel?: LogLevel;
	loop?: boolean;
};
