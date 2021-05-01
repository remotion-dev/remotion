import {RemotionAudioProps} from './audio';
import {RemotionVideoProps} from './video';

export const validateMediaProps = (
	props: RemotionVideoProps | RemotionAudioProps,
	component: 'Video' | 'Audio'
) => {
	if (
		typeof props.volume !== 'number' &&
		typeof props.volume !== 'function' &&
		typeof props.volume !== 'undefined'
	) {
		throw new TypeError(
			`You have passed a volume of type ${typeof props.volume} to your <${component} /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined.`
		);
	}

	if (typeof props.volume === 'number' && props.volume < 0) {
		throw new TypeError(
			`You have passed a volume below 0 to your <${component} /> component. Volume must be between 0 and 1`
		);
	}
};
