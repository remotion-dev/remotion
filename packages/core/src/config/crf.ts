type Crf = number | undefined;

let currentCrf: Crf = undefined;

export const setCrf = (newCrf: Crf) => {
	currentCrf = newCrf;
};

export const getCrf = () => {
	return currentCrf;
};
