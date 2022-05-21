import {VolumeProp} from '../volume-prop';

export type RemotionMainVideoProps = {
	startFrom?: number;
	endAt?: number;
};

export type RemotionVideoProps = Omit<
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>,
	'autoPlay' | 'controls' | 'loop' | 'onEnded'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
};

export type RemotionOffthreadVideoProps = React.DetailedHTMLProps<
	React.ImgHTMLAttributes<HTMLImageElement>,
	HTMLImageElement
> & {
	volume?: VolumeProp;
	playbackRate?: number;
	muted?: boolean;
};
