type LastSeek = {
	byte: number;
	numberOfTimes: number;
	lastSeekTime: number;
};

export const seekInfiniteLoopDetectionState = () => {
	let lastSeek: LastSeek | null = null;

	return (byte: number) => {
		const now = Date.now();

		if (!lastSeek || lastSeek.byte !== byte) {
			lastSeek = {byte, numberOfTimes: 1, lastSeekTime: now};
			return;
		}

		const timeSinceLastSeek = now - lastSeek.lastSeekTime;
		if (timeSinceLastSeek >= 200) {
			lastSeek = {byte, numberOfTimes: 1, lastSeekTime: now};
			return;
		}

		lastSeek.numberOfTimes++;
		if (lastSeek.numberOfTimes >= 50) {
			throw new Error(
				`Seeking infinite loop detected: Seeked to byte 0x${byte.toString(16)} ${lastSeek.numberOfTimes} times in a row with less than 200ms inbetween. Check your usage of .seek().`,
			);
		}
	};
};
