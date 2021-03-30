import {VolumeProp} from '../volume-prop';

export type RemotionMainAudioProps = {
	startAt?: number;
	endAt?: number;
};

export type RemotionAudioProps = Omit<
	React.DetailedHTMLProps<
		React.AudioHTMLAttributes<HTMLAudioElement>,
		HTMLAudioElement
	>,
	'autoplay' | 'controls'
> & {
	volume?: VolumeProp;
};
