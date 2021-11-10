const key = 'remotion.loop';

export const persistLoopOption = (option: boolean) => {
	localStorage.setItem(key, String(option));
};

export const loadLoopOption = (): boolean => {
	const item = localStorage.getItem(key);
	return item !== 'false';
};
