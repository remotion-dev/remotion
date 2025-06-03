let currentImageSequencePattern: string | undefined;

export const setImageSequencePattern = (pattern: string | undefined) => {
	currentImageSequencePattern = pattern;
};

export const getImageSequencePattern = () => {
	return currentImageSequencePattern;
};
