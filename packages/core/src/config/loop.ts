export type Loop = number | null;

let currentLoop: Loop = null;

export const setNumberOfGifLoops = (newLoop: Loop | null) => {
	if (newLoop !== null && typeof newLoop !== 'number') {
		throw new Error('--number-of-gif-loops flag must be a number.');
	}

	currentLoop = newLoop;
};

export const getLoop = () => {
	return currentLoop;
};
