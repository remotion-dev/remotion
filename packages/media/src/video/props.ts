import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	SequenceProps,
	VolumeProp,
} from 'remotion';
import type {EffectsProp} from 'remotion';
import type {MediaOnError} from '../on-error';

export type MediaErrorEvent = {
	error: Error;
};

export type VideoObjectFit =
	| 'fill'
	| 'contain'
	| 'cover'
	| 'none'
	| 'scale-down';

export type FallbackOffthreadVideoProps = {
	acceptableTimeShiftInSeconds?: number;
	transparent?: boolean;
	toneMapped?: boolean;
	onError?: (err: Error) => void;
	crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
	useWebAudioApi?: boolean;
	pauseWhenBuffering?: boolean;
	onAutoPlayError?: null | (() => void);
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
	toneFrequency: number;
	showInTimeline: boolean;
	debugOverlay: boolean;
	headless: boolean;
	onError: MediaOnError | undefined;
	credentials: RequestCredentials | undefined;
	objectFit: VideoObjectFit;
	_experimentalInitiallyDrawCachedFrame: boolean;
	_experimentalEffects: EffectsProp;
};

export type InnerVideoProps = MandatoryVideoProps &
	OuterVideoProps &
	OptionalVideoProps;

export type VideoProps = MandatoryVideoProps &
	Partial<OuterVideoProps> &
	Partial<OptionalVideoProps> &
	Pick<SequenceProps, 'durationInFrames' | 'from' | 'name'>;
