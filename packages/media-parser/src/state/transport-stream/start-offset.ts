export const startOffsetStore = () => {
	let offset = 0;

	return {
		getOffset: () => offset,
		setOffset: (newOffset: number) => {
			offset = newOffset;
		},
	};
};
