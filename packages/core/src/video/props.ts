import type React from 'react';
import type {VolumeProp} from '../volume-prop';

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
	acceptableTimeshift?: number;
};

export type OffthreadVideoImageFormat = 'png' | 'jpeg';

export type OffthreadVideoProps = {
	src: string;
	className?: string;
	style?: React.CSSProperties;
	volume?: VolumeProp;
	playbackRate?: number;
	muted?: boolean;
	onError?: React.ReactEventHandler<HTMLVideoElement | HTMLImageElement>;
	imageFormat?: OffthreadVideoImageFormat;
	acceptableTimeShiftInSeconds?: number;
};
