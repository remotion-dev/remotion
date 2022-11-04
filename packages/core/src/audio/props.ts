import type {VolumeProp} from '../volume-prop';

export type RemotionMainAudioProps = {
	startFrom?: number;
	endAt?: number;
};

export type RemotionAudioProps = Omit<
	React.DetailedHTMLProps<
		React.AudioHTMLAttributes<HTMLAudioElement>,
		HTMLAudioElement
	>,
	'autoPlay' | 'controls' | 'onEnded' | 'nonce'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
	acceptableTimeShiftInSeconds?: number;
};
