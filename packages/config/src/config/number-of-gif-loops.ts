import type {Codec} from '@remotion/renderer';

export type Loop = number | null;

let currentLoop: Loop = null;

export const setNumberOfGifLoops = (newLoop: Loop | null) => {
	if (newLoop !== null && typeof newLoop !== 'number') {
		throw new Error('--number-of-gif-loops flag must be a number.');
	}

	currentLoop = newLoop;
};

export const getAndValidateNumberOfGifLoops = (codec: Codec) => {
	if (currentLoop === null) {
		return currentLoop;
	}

	if (codec !== 'gif') {
		throw new Error(
			`The "numberOfGifLoops" setting can only be used for GIFs. The codec is set to ${codec}`
		);
	}

	return currentLoop;
};
