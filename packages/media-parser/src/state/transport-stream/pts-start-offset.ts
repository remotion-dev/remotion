export const ptsStartOffsetStore = () => {
	const offsets: Record<number, number> = {};

	return {
		getOffset: (trackId: number) => offsets[trackId] || 0,
		setOffset: ({newOffset, trackId}: {trackId: number; newOffset: number}) => {
			offsets[trackId] = newOffset;
		},
	};
};

export type PtsStartOffsetState = ReturnType<typeof ptsStartOffsetStore>;
