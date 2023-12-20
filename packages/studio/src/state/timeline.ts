const localStorageKey = (id: string) => `remotion.editor.timelineFlex.${id}`;

const persistTimelineFlex = (value: number, id: string) => {
	localStorage.setItem(localStorageKey(id), String(value));
};

const loadTimelineFlex = (id: string): number | null => {
	const item = localStorage.getItem(localStorageKey(id));

	return item ? parseFloat(item) : null;
};

export const useTimelineFlex = (
	id: string,
): [number | null, (value: number) => void] => {
	return [
		loadTimelineFlex(id),
		(value: number) => persistTimelineFlex(value, id),
	];
};
