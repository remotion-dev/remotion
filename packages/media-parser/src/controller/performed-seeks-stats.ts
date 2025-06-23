export type PerformedSeek = {
	from: number;
	to: number;
	type: 'user-initiated' | 'internal';
};

export const performedSeeksStats = () => {
	const performedSeeks: PerformedSeek[] = [];

	const markLastSeekAsUserInitiated = () => {
		if (performedSeeks.length > 0) {
			performedSeeks[performedSeeks.length - 1].type = 'user-initiated';
		}
	};

	return {
		recordSeek: (seek: PerformedSeek) => {
			performedSeeks.push(seek);
		},
		getPerformedSeeks: () => {
			return performedSeeks;
		},
		markLastSeekAsUserInitiated,
	};
};

export type PerformedSeeksSignal = ReturnType<typeof performedSeeksStats>;
