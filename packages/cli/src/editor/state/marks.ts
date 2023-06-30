const localStorageKey = (comp: string, durationInFrames: number) =>
	`remotion.editor.marks.${comp}.${durationInFrames}`;

export const persistMarks = (
	comp: string,
	durationInFrames: number,
	marks: [number | null, number | null]
) => {
	localStorage.setItem(
		localStorageKey(comp, durationInFrames),
		JSON.stringify(marks)
	);
};

export const loadMarks = (
	comp: string,
	durationInFrames: number | undefined
): [number | null, number | null] => {
	if (durationInFrames === undefined) {
		return [null, null];
	}

	const item = localStorage.getItem(localStorageKey(comp, durationInFrames));

	if (item === null) {
		return [null, null];
	}

	return JSON.parse(item);
};
