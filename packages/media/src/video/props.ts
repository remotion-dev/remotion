import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	VolumeProp,
} from 'remotion';

export type FallbackOffthreadVideoProps = {
	acceptableTimeShiftInSeconds?: number;
	toneFrequency?: number;
	transparent?: boolean;
	toneMapped?: boolean;
	onError?: (err: Error) => void;
};

type MandatoryVideoProps = {
	src: string;
};

type OuterVideoProps = {
	trimBefore: number | undefined;
	trimAfter: number | undefined;
};

type OptionalVideoProps = {
	className: string | undefined;
	volume: VolumeProp;
	loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	name: string | undefined;
	onVideoFrame: OnVideoFrame | undefined;
	playbackRate: number;
	muted: boolean;
	delayRenderRetries: number | null;
	delayRenderTimeoutInMilliseconds: number | null;
	style: React.CSSProperties;
	/**
	 * @deprecated For internal use only
	 */
	stack: string | undefined;
	logLevel: LogLevel;
	loop: boolean;
	audioStreamIndex: number;
	disallowFallbackToOffthreadVideo: boolean;
	fallbackOffthreadVideoProps: FallbackOffthreadVideoProps;
	trimAfter: number | undefined;
	trimBefore: number | undefined;
	showInTimeline: boolean;
};

export type InnerVideoProps = MandatoryVideoProps &
	OuterVideoProps &
	OptionalVideoProps;

export type VideoProps = MandatoryVideoProps &
	Partial<OuterVideoProps> &
	Partial<OptionalVideoProps>;
