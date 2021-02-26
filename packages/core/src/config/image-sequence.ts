let imageSequence = false;

export const setImageSequence = (newImageSequence: boolean) => {
	if (typeof newImageSequence !== 'boolean') {
		throw new TypeError('setImageSequence accepts a Boolean Value');
	}
	imageSequence = newImageSequence;
};

export const getShouldOutputImageSequence = () => {
	return imageSequence;
};
