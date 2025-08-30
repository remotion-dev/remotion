import type {LoopVolumeCurveBehavior, OnVideoFrame, VolumeProp} from 'remotion';
import type {LogLevel} from './log';

export type NewVideoProps = {
	src: string;
	trimBefore?: number;
	trimAfter?: number;
	volume?: VolumeProp;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	name?: string;
	toneFrequency?: number;
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
	audioStreamIndex?: number;
	logLevel?: LogLevel;
};
