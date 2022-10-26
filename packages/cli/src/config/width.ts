let passedWidth: number | null = null;

export const setWidth = (newWidth: number) => {
	if (typeof newWidth !== 'number') {
		throw new Error(
			'--width flag / setWidth() must be a number, but got ' +
				JSON.stringify(newWidth)
		);
	}

	passedWidth = newWidth;
};

export const getWidth = (): number | null => {
	return passedWidth;
};
