export const AMOUNT_OF_BARS = 68;

export const makeWaveformVisualizer = (options: {
	onWaveformBars: (bars: number[]) => void;
}) => {
	const bars = {
		durationInMicroseconds: 0,
	};
	let duration: number | null = null;

	const combinedBars: number[] = [];

	return {
		add: (frame: AudioData) => {
			bars.durationInMicroseconds += frame.duration ?? 0;
			if (duration !== null) {
				const progress = bars.durationInMicroseconds / 1_000_000 / duration;
				const bar = Math.round(progress * AMOUNT_OF_BARS);
				while (combinedBars.length < bar) {
					const allocationSize = frame.allocationSize({
						planeIndex: 0,
						format: 's16',
					});
					const arr = new Uint8Array(allocationSize);

					frame.copyTo(arr, {planeIndex: 0, format: 's16'});

					const average = arr.reduce((a, b) => a + b, 0) / arr.length;

					combinedBars.push(average);
					options.onWaveformBars([...combinedBars]);
				}
			}
		},
		setDuration: (d: number) => {
			duration = d;
		},
	};
};
