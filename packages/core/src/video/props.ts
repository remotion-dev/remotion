import {VolumeProp} from '../volume-prop';

export type RemotionMainVideoProps = {
	startAt?: number;
	endAt?: number;
};

export type RemotionVideoProps = Omit<
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	>,
	'autoplay' | 'controls'
> & {
	volume?: VolumeProp;
};
