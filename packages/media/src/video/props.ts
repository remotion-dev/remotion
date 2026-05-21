import type {
	EffectDefinitionAndStack,
	EffectsProp,
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	SequenceProps,
	VolumeProp,
} from 'remotion';
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
	preservePitch?: boolean;
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
	/**
	 * @deprecated Use `requestInit={{credentials: ...}}` instead.
	 */
	credentials: RequestCredentials | undefined;
	requestInit: RequestInit | undefined;
	objectFit: VideoObjectFit;
	_experimentalInitiallyDrawCachedFrame: boolean;
	effects: EffectsProp;
};

export type InnerVideoProps = MandatoryVideoProps &
	OuterVideoProps &
	Omit<OptionalVideoProps, 'effects'> & {
		effects: EffectDefinitionAndStack<unknown>[];
	};

export type VideoProps = MandatoryVideoProps &
	Partial<OuterVideoProps> &
	Partial<OptionalVideoProps> &
	Pick<SequenceProps, 'durationInFrames' | 'from' | 'name' | 'hidden'>;
