import type {Codec} from './codec';

export const validateEveryNthFrame = (everyNthFrame: unknown, codec: Codec) => {
	if (typeof everyNthFrame === 'undefined') {
		throw new TypeError(`Argument missing for parameter "everyNthFrame"`);
	}

	if (typeof everyNthFrame !== 'number') {
		throw new TypeError(
			`Argument passed to "everyNthFrame" is not a number: ${everyNthFrame}`
		);
	}

	if (everyNthFrame < 1) {
		throw new RangeError(
			`The value for "everyNthFrame" cannot be below 1, but is ${everyNthFrame}`
		);
	}

	if (!Number.isFinite(everyNthFrame)) {
		throw new RangeError(`"everyNthFrame" ${everyNthFrame} is not finite`);
	}

	if (everyNthFrame % 1 !== 0) {
		throw new RangeError(
			`Argument for everyNthFrame must be an integer, but got ${everyNthFrame}`
		);
	}

	if (everyNthFrame === 1) {
		return everyNthFrame;
	}

	// h264-mkv because that is what is being used on Lambda
	if (codec !== 'gif' && codec !== 'h264-mkv') {
		throw new Error(
			`"everyNthFrame" can only be set if "codec" is set to "gif". The codec is "${codec}"`
		);
	}
};
