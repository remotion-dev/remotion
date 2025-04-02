type LastSeek = {
	byte: number;
	numberOfTimes: number;
};

export const seekInfiniteLoopDetectionState = () => {
	let lastSeek: LastSeek | null = null;

	return {
		registerSeek: (byte: number) => {
			if (!lastSeek || lastSeek.byte !== byte) {
				lastSeek = {byte, numberOfTimes: 1};
				return;
			}

			lastSeek.numberOfTimes++;
			if (lastSeek.numberOfTimes >= 10) {
				throw new Error(
					`Seeking infinite loop detected: Seeked to byte 0x${byte.toString(16)} ${lastSeek.numberOfTimes} times in a row with no position change in the file. Check your usage of .seek().`,
				);
			}
		},
		reset: () => {
			lastSeek = null;
		},
	};
};

export type SeekInfiniteLoop = ReturnType<
	typeof seekInfiniteLoopDetectionState
>;
