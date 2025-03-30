export const startOffsetStore = () => {
	const offsets: Record<number, number> = {};

	return {
		getOffset: (trackId: number) => offsets[trackId] || 0,
		setOffset: (trackId: number, newOffset: number) => {
			offsets[trackId] = newOffset;
		},
	};
};
