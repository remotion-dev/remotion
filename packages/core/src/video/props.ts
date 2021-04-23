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
	'autoplay' | 'controls' | 'loop'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
};
