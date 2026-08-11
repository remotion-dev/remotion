export const rememberActualMatroskaTimestamps = (isMatroska: boolean) => {
	const observations: number[] = [];

	const observeTimestamp = (startTime: number) => {
		if (!isMatroska) {
			return;
		}

		observations.push(startTime);
	};

	const getRealTimestamp = (observedTimestamp: number) => {
		if (!isMatroska) {
			return observedTimestamp;
		}

		return (
			observations.find(
				(observation) => Math.abs(observedTimestamp - observation) < 0.001,
			) ?? null
		);
	};

	return {
		observeTimestamp,
		getRealTimestamp,
	};
};

export type RememberActualMatroskaTimestamps = ReturnType<
	typeof rememberActualMatroskaTimestamps
>;
