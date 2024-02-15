const key = 'remotion.mute';

export const persistMuteOption = (option: boolean) => {
	localStorage.setItem(key, String(option));
};

export const loadMuteOption = (): boolean => {
	const item = localStorage.getItem(key);
	return item === 'true';
};
