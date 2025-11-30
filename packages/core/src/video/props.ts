import type React from 'react';
import type {LoopVolumeCurveBehavior} from '../audio/use-audio-frame.js';
import type {VolumeProp} from '../volume-prop.js';

export type CommonVideoProps = {
	/**
	 * @deprecated `startFrom` was renamed to `trimBefore`
	 */
	startFrom: number | undefined;
	/**
	 * @deprecated `endAt` was renamed to `trimAfter`
	 */
	endAt: number | undefined;
	/**
	 * Trim of the video from the left (start) in frames.
	 */
	trimBefore: number | undefined;
	/**
	 * Trim of the video from the right (end) in frames.
	 */
	trimAfter: number | undefined;
	/**
	 * @deprecated Only for internal `transparent` use
	 */
	_remotionInternalNativeLoopPassed: boolean;
};

export type RemotionMainVideoProps = Partial<CommonVideoProps>;

export type NativeVideoProps = Omit<
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>,
	| 'autoPlay'
	| 'controls'
	| 'onEnded'
	| 'nonce'
	| 'onError'
	| 'disableRemotePlayback'
>;

export type RemotionVideoProps = NativeVideoProps & {
	name?: string;
	volume?: VolumeProp;
	playbackRate?: number;
	acceptableTimeShiftInSeconds?: number;
	allowAmplificationDuringRender?: boolean;
	useWebAudioApi?: boolean;
	toneFrequency?: number;
	pauseWhenBuffering?: boolean;
	showInTimeline?: boolean;
	delayRenderTimeoutInMilliseconds?: number;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	delayRenderRetries?: number;
	onError?: (err: Error) => void;
	onAutoPlayError?: null | (() => void);
	audioStreamIndex?: number;
};

type DeprecatedOffthreadVideoProps = {
	/**
	 * @deprecated Use the `transparent` prop instead
	 */
	imageFormat: never;
};

type MandatoryOffthreadVideoProps = {
	src: string;
};

type OptionalOffthreadVideoProps = {
	className: string | undefined;
	name: string | undefined;
	id: string | undefined;
	style: React.CSSProperties | undefined;
	volume: VolumeProp | undefined;
	playbackRate: number;
	muted: boolean;
	onError: undefined | ((err: Error) => void);
	acceptableTimeShiftInSeconds: undefined | number;
	allowAmplificationDuringRender: boolean;
	toneFrequency: number;
	transparent: boolean;
	toneMapped: boolean;
	pauseWhenBuffering: boolean;
	loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	delayRenderTimeoutInMilliseconds: number | undefined;
	delayRenderRetries: number | undefined;
	useWebAudioApi: boolean;
	/**
	 * @deprecated For internal use only
	 */
	stack: string | undefined;
	showInTimeline: boolean;
	onAutoPlayError: null | (() => void);
	onVideoFrame: OnVideoFrame | undefined;
	crossOrigin: '' | 'anonymous' | 'use-credentials' | undefined;
	audioStreamIndex: number;
};

export type AllOffthreadVideoProps = MandatoryOffthreadVideoProps &
	OptionalOffthreadVideoProps &
	CommonVideoProps;

export type RemotionOffthreadVideoProps = MandatoryOffthreadVideoProps &
	Partial<OptionalOffthreadVideoProps> &
	Partial<CommonVideoProps> &
	Partial<DeprecatedOffthreadVideoProps>;

export type OnVideoFrame = (frame: CanvasImageSource) => void;
