import type React from 'react';
import type {
	EffectDefinitionAndStack,
	EffectsProp,
	InteractiveBaseProps,
	InteractiveCropProps,
	InteractivePremountProps,
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	VolumeProp,
} from 'remotion';
import type {MediaOnError} from '../on-error';
import type {MediaRequestInit} from '../request-init';

export type MediaErrorEvent = {
	error: Error;
};

export type PreviewSize = {
	width: number;
	height: number;
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
	 * @deprecated Use `requestInit={{credentials: ...}}` instead. If both are
	 * passed, `requestInit.credentials` wins over this prop.
	 */
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
	objectFit: VideoObjectFit;
	/**
	 * Maximum preview backing dimensions in pixels (positive integers).
	 * Preserves source aspect ratio; never upscales. Set CSS width/height to
	 * preserve layout independently of the canvas's reduced intrinsic size.
	 * Sampled on mount; remount to change resolution.
	 * Effects and onVideoFrame receive reduced frames. Ignored for rendering
	 * and headless playback. The caller may derive this from useCurrentScale().
	 */
	previewSize: PreviewSize | null;
	_experimentalInitiallyDrawCachedFrame: boolean;
	effects: EffectsProp;
};

export type NativeVideoProps = Omit<
	React.HTMLAttributes<HTMLElement>,
	| keyof MandatoryVideoProps
	| keyof OuterVideoProps
	| keyof OptionalVideoProps
	| 'onError'
> &
	Record<`data-${string}`, string | undefined>;

export type InnerVideoProps = MandatoryVideoProps &
	OuterVideoProps &
	Omit<OptionalVideoProps, 'effects'> &
	NativeVideoProps & {
		effects: EffectDefinitionAndStack<unknown>[];
		_remotionInternalStack: string | undefined;
	};

export type VideoProps = MandatoryVideoProps &
	Partial<OuterVideoProps> &
	Partial<OptionalVideoProps> &
	NativeVideoProps &
	InteractiveBaseProps &
	InteractiveCropProps &
	InteractivePremountProps;
