import type {LogLevel, OnVideoFrame, VolumeProp} from 'remotion';

export type VideoProps = {
	src: string;
	className?: string;
	trimBefore?: number;
	trimAfter?: number;
	volume?: VolumeProp;
	name?: string;
	pauseWhenBuffering?: boolean;
	showInTimeline?: boolean;
	onVideoFrame?: OnVideoFrame;
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
};
