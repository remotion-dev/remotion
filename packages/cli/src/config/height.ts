let specifiedHeight: number | null;

export const setHeight = (newHeight: number) => {
	if (typeof newHeight !== 'number') {
		throw new Error(
			'--height flag / setHeight() must be a number, but got ' +
				JSON.stringify(newHeight)
		);
	}

	specifiedHeight = newHeight;
};

export const getHeight = (): number | null => {
	return specifiedHeight;
};
