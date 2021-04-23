import {VolumeProp} from '../volume-prop';

export type RemotionMainAudioProps = {
	startFrom?: number;
	endAt?: number;
};

export type RemotionAudioProps = Omit<
	React.DetailedHTMLProps<
		React.AudioHTMLAttributes<HTMLAudioElement>,
		HTMLAudioElement
	>,
	'autoplay' | 'controls' | 'loop'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
};
