import type React from 'react';
import type {VolumeProp} from '../volume-prop.js';

export type RemotionMainVideoProps = {
	startFrom?: number;
	endAt?: number;
};

export type RemotionVideoProps = Omit<
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>,
	'autoPlay' | 'controls' | 'onEnded' | 'nonce'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
	acceptableTimeShiftInSeconds?: number;
	allowAmplificationDuringRender?: boolean;
};

type DeprecatedOffthreadVideoProps = {
	/**
	 * @deprecated Use the `transparent` prop instead
	 */
	imageFormat: never;
};

export type OffthreadVideoProps = {
	src: string;
	className?: string;
	style?: React.CSSProperties;
	volume?: VolumeProp;
	playbackRate?: number;
	muted?: boolean;
	onError?: React.ReactEventHandler<HTMLVideoElement | HTMLImageElement>;
	acceptableTimeShiftInSeconds?: number;
	allowAmplificationDuringRender?: boolean;
	transparent?: boolean;
} & DeprecatedOffthreadVideoProps;
