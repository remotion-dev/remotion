import type {Codec} from './codec';

export const validateNumberOfGifLoops = (
	numberOfGifLoops: unknown,
	codec: Codec,
) => {
	if (typeof numberOfGifLoops === 'undefined' || numberOfGifLoops === null) {
		return;
	}

	if (typeof numberOfGifLoops !== 'number') {
		throw new TypeError(
			`Argument passed to "numberOfGifLoops" is not a number: ${numberOfGifLoops}`,
		);
	}

	if (numberOfGifLoops < 0) {
		throw new RangeError(
			`The value for "numberOfGifLoops" cannot be below 0, but is ${numberOfGifLoops}`,
		);
	}

	if (!Number.isFinite(numberOfGifLoops)) {
		throw new RangeError(
			`"numberOfGifLoops" ${numberOfGifLoops} is not finite`,
		);
	}

	if (numberOfGifLoops % 1 !== 0) {
		throw new RangeError(
			`Argument for numberOfGifLoops must be an integer, but got ${numberOfGifLoops}`,
		);
	}

	if (codec !== 'gif') {
		throw new Error(
			`"everyNthFrame" can only be set if "codec" is set to "gif". The codec is "${codec}"`,
		);
	}
};
