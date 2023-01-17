import type {VolumeProp} from '../volume-prop';

export type RemotionMainAudioProps = {
	startFrom?: number;
	endAt?: number;
};

// TODO: This breaks occasionally if the types of Audio break
export type RemotionAudioProps = Omit<
	React.DetailedHTMLProps<
		React.AudioHTMLAttributes<HTMLAudioElement>,
		HTMLAudioElement
	>,
	'autoPlay' | 'controls' | 'onEnded' | 'nonce' | 'onResize' | 'onResizeCapture'
> & {
	volume?: VolumeProp;
	playbackRate?: number;
	acceptableTimeShiftInSeconds?: number;
	allowAmplificationDuringRender?: boolean;
};
