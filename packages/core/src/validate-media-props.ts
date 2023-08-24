import type {RemotionAudioProps} from './audio/index.js';
import type {RemotionVideoProps} from './video/index.js';
import type {OffthreadVideoProps} from './video/props.js';

export const validateMediaProps = (
	props: RemotionVideoProps | RemotionAudioProps | OffthreadVideoProps,
	component: 'Video' | 'Audio',
) => {
	if (
		typeof props.volume !== 'number' &&
		typeof props.volume !== 'function' &&
		typeof props.volume !== 'undefined'
	) {
		throw new TypeError(
			`You have passed a volume of type ${typeof props.volume} to your <${component} /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined.`,
		);
	}

	if (typeof props.volume === 'number' && props.volume < 0) {
		throw new TypeError(
			`You have passed a volume below 0 to your <${component} /> component. Volume must be between 0 and 1`,
		);
	}

	if (
		typeof props.playbackRate !== 'number' &&
		typeof props.playbackRate !== 'undefined'
	) {
		throw new TypeError(
			`You have passed a playbackRate of type ${typeof props.playbackRate} to your <${component} /> component. Playback rate must a real number or undefined.`,
		);
	}

	if (
		typeof props.playbackRate === 'number' &&
		(isNaN(props.playbackRate) ||
			!Number.isFinite(props.playbackRate) ||
			props.playbackRate <= 0)
	) {
		throw new TypeError(
			`You have passed a playbackRate of ${props.playbackRate} to your <${component} /> component. Playback rate must be a real number above 0.`,
		);
	}
};
