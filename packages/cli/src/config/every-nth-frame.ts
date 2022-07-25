import type {Codec} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

let everyNthFrame = 1;

export const setEveryNthFrame = (frame: number) => {
	RenderInternals.validateEveryNthFrame(frame);
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
