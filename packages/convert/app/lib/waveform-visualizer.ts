export const AMOUNT_OF_BARS = 65;

export const makeWaveformVisualizer = (options: {
	onWaveformBars: (bars: number[]) => void;
}) => {
	const bars = {
		values: [] as number[],
		durationInMicroseconds: 0,
	};
	let duration: number | null = null;

	const combinedBars: number[] = [];

	return {
		add: (frame: AudioData) => {
			bars.durationInMicroseconds += frame.duration ?? 0;
			if (duration !== null) {
				const progress = bars.durationInMicroseconds / 1_000_000 / duration;
				const bar = Math.floor(progress * AMOUNT_OF_BARS);
				if (combinedBars.length < bar) {
					const arr = new Uint8Array(
						frame.allocationSize({planeIndex: 0, format: 's16'}),
					);
					frame.copyTo(arr, {planeIndex: 0, format: 's16'});

					const average = arr.reduce((a, b) => a + b, 0) / arr.length;
					bars.values.push(average);

					combinedBars.push(average);
					options.onWaveformBars(combinedBars);
				}
			}
		},
		setDuration: (d: number) => {
			duration = d;
		},
	};
};
