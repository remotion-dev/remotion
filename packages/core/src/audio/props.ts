import type {VolumeProp} from '../volume-prop';

export type RemotionMainAudioProps = {
	startFrom?: number;
	endAt?: number;
  maxDuration?: number;
};

export type RemotionAudioProps = Omit<
	React.DetailedHTMLProps<
		React.AudioHTMLAttributes<HTMLAudioElement>,
		HTMLAudioElement
	>,
	'autoPlay' | 'controls' | 'onEnded'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
};
