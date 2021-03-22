const localStorageKey = 'remotion.editor.timelineFlex';

const persistTimelineFlex = (value = 0.2) => {
	localStorage.setItem(localStorageKey, String(value));
};

const loadTimelineFlex = (): number => {
	const item = localStorage.getItem(localStorageKey);

	return item ? parseFloat(item) : 0.2;
};

export const useTimelineFlex = (): [number, (value?: number) => void] => {
	return [loadTimelineFlex(), persistTimelineFlex];
};
