import type React from 'react';
import type {LoopVolumeCurveBehavior} from '../audio/use-audio-frame.js';
import type {VolumeProp} from '../volume-prop.js';

export type RemotionMainVideoProps = {
	/**
	 * @deprecated `startFrom` was renamed to `trimBefore`
	 */
	startFrom?: number;
	/**
	 * @deprecated `endAt` was renamed to `trimAfter`
	 */
	endAt?: number;
	/**
	 * Trim of th e video from the left (start) in frames.
	 */
	trimBefore?: number;
	/**
	 * Trim of the video from the right (end) in frames.
	 */
	trimAfter?: number;
	/**
	 * @deprecated Only for internal `transparent` use
	 */
	_remotionInternalNativeLoopPassed?: boolean;
};

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
	audioChannelIndex?: number;
};

type DeprecatedOffthreadVideoProps = {
	/**
	 * @deprecated Use the `transparent` prop instead
	 */
	imageFormat?: never;
};

export type RemotionOffthreadVideoProps = {
	src: string;
	className?: string;
	name?: string;
	id?: string;
	style?: React.CSSProperties;
	volume?: VolumeProp;
	playbackRate?: number;
	muted?: boolean;
	onError?: (err: Error) => void;
	acceptableTimeShiftInSeconds?: number;
	allowAmplificationDuringRender?: boolean;
	toneFrequency?: number;
	transparent?: boolean;
	toneMapped?: boolean;
	pauseWhenBuffering?: boolean;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	delayRenderTimeoutInMilliseconds?: number;
	delayRenderRetries?: number;
	useWebAudioApi?: boolean;
	/**
	 * @deprecated For internal use only
	 */
	stack?: string;
	showInTimeline?: boolean;
	onAutoPlayError?: null | (() => void);
	onVideoFrame?: OnVideoFrame;
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
	audioChannelIndex?: number;
} & RemotionMainVideoProps &
	DeprecatedOffthreadVideoProps;

export type OnVideoFrame = (frame: CanvasImageSource) => void;
