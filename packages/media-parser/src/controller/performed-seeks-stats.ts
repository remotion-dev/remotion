export type PerformedSeek = {
	from: number;
	to: number;
	type: 'user-initiated' | 'internal';
};

export const performedSeeksStats = () => {
	const performedSeeks: PerformedSeek[] = [];

	return {
		recordSeek: (seek: PerformedSeek) => {
			performedSeeks.push(seek);
		},
		getPerformedSeeks: () => {
			return performedSeeks;
		},
	};
};

export type PerformedSeeksSignal = ReturnType<typeof performedSeeksStats>;
