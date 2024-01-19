const aspectRatioLocalStorageKey = 'aspectRatio';

export const persistAspectRatioOption = (option: boolean) => {
	localStorage.setItem(aspectRatioLocalStorageKey, String(option));
};

export const loadAspectRatioOption = () => {
	const item = localStorage.getItem(aspectRatioLocalStorageKey);
	if (item === null) {
		return true;
	}

	return item !== 'false';
};
