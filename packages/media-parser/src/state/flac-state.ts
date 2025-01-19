export const flacState = () => {
	let blockingBitStrategy: undefined | number;

	return {
		setBlockingBitStrategy: (strategy: number) => {
			blockingBitStrategy = strategy;
		},
		getBlockingBitStrategy: () => blockingBitStrategy,
	};
};
