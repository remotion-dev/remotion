export const makeOffsetCounter = (initial: number) => {
	let offset = initial;
	let discardedBytes = 0;

	return {
		getOffset: () => offset,
		discardBytes: (bytes: number) => {
			discardedBytes += bytes;
		},
		increment: (bytes: number) => {
			if (bytes < 0) {
				throw new Error('Cannot increment by a negative amount: ' + bytes);
			}

			offset += bytes;
		},
		getDiscardedBytes: () => discardedBytes,
		setDiscardedOffset: (bytes: number) => {
			discardedBytes = bytes;
		},
		getDiscardedOffset: () => offset - discardedBytes,
		decrement: (bytes: number) => {
			if (bytes < 0) {
				throw new Error('Cannot decrement by a negative amount: ' + bytes);
			}

			offset -= bytes;
		},
	};
};

export type OffsetCounter = ReturnType<typeof makeOffsetCounter>;
