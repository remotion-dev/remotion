export type Loop = number | null;

let currentLoop: Loop = null;

export const setLoop = (newLoop: Loop) => {
	if (typeof newLoop !== 'number') {
		throw new Error('--loop flag must be a number.');
	}

	currentLoop = newLoop;
};

export const getLoop = () => {
	return currentLoop;
};
