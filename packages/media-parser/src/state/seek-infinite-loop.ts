type LastSeek = {
	byte: number;
	numberOfTimes: number;
};

export const seekInfiniteLoopDetectionState = () => {
	let lastSeek: LastSeek | null = null;
	let firstSeekTime: number | null = null;

	return {
		registerSeek: (byte: number) => {
			const now = Date.now();

			if (!lastSeek || lastSeek.byte !== byte) {
				lastSeek = {byte, numberOfTimes: 1};
				firstSeekTime = now;
				return;
			}

			lastSeek.numberOfTimes++;
			if (
				lastSeek.numberOfTimes >= 10 &&
				firstSeekTime &&
				now - firstSeekTime <= 2000
			) {
				throw new Error(
					`Seeking infinite loop detected: Seeked to byte 0x${byte.toString(16)} ${lastSeek.numberOfTimes} times in a row in the last 2 seconds. Check your usage of .seek().`,
				);
			}

			if (now - (firstSeekTime as number) > 2000) {
				lastSeek = {byte, numberOfTimes: 1};
				firstSeekTime = now;
			}
		},
		reset: () => {
			lastSeek = null;
			firstSeekTime = null;
		},
	};
};

export type SeekInfiniteLoop = ReturnType<
	typeof seekInfiniteLoopDetectionState
>;
