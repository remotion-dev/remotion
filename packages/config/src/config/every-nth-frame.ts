import {Codec} from '@remotion/renderer';
import {validateEveryNthFrame} from '../validation/validate-every-nth-frame';

let everyNthFrame = 1;

export const setEveryNthFrame = (frame: number) => {
	validateEveryNthFrame(frame);
	everyNthFrame = frame;
};

export const getAndValidateEveryNthFrame = (codec: Codec) => {
	if (everyNthFrame === 1) {
		return everyNthFrame;
	}

	if (codec !== 'gif') {
		throw new Error(
			`"everyNthFrame" can only be set if "codec" is set to "gif". The codec is "${codec}"`
		);
	}

	return everyNthFrame;
};
