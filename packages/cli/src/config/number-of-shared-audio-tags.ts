let numberOfSharedAudioTags = 0;

export const getNumberOfSharedAudioTags = () => {
	return numberOfSharedAudioTags;
};

export const setNumberOfSharedAudioTags = (audioTags: number) => {
	numberOfSharedAudioTags = audioTags;
};
