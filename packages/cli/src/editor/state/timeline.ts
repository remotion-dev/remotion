const localStorageKey = 'remotion.editor.timelineFlex';

const persistTimelineFlex = (value: number) => {
	localStorage.setItem(localStorageKey, String(value));
};

const loadTimelineFlex = (): number | null => {
	const item = localStorage.getItem(localStorageKey);

	return item ? parseFloat(item) : null;
};

export const useTimelineFlex = (): [number | null, (value: number) => void] => {
	return [loadTimelineFlex(), persistTimelineFlex];
};
