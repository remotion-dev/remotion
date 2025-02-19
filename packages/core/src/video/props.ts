import type React from 'react';
import type {LoopVolumeCurveBehavior} from '../audio/use-audio-frame.js';
import type {VolumeProp} from '../volume-prop.js';

export type RemotionMainVideoProps = {
	startFrom?: number;
	endAt?: number;
	/**
	 * @deprecated Only for internal `transparent` use
	 */
	_remotionInternalNativeLoopPassed?: boolean;
};

export type RemotionVideoProps = Omit<
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
> & {
	name?: string;
	volume?: VolumeProp;
	playbackRate?: number;
	acceptableTimeShiftInSeconds?: number;
	allowAmplificationDuringRender?: boolean;
	toneFrequency?: number;
	pauseWhenBuffering?: boolean;
	showInTimeline?: boolean;
	delayRenderTimeoutInMilliseconds?: number;
	loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	delayRenderRetries?: number;
	onError?: (err: Error) => void;
	onAutoPlayError?: null | (() => void);
};

type DeprecatedOffthreadVideoProps = {
	/**
	 * @deprecated Use the `transparent` prop instead
	 */
	imageFormat?: never;
};

export type OffthreadVideoProps = {
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
	/**
	 * @deprecated For internal use only
	 */
	stack?: string;
	showInTimeline?: boolean;
	onAutoPlayError?: null | (() => void);
	onVideoFrame?: OnVideoFrame;
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
} & RemotionMainVideoProps &
	DeprecatedOffthreadVideoProps;

export type OnVideoFrame = (frame: CanvasImageSource) => void;
