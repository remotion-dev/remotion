export const AMOUNT_OF_BARS = 68;

export const makeWaveformVisualizer = (options: {
	onWaveformBars: (bars: number[]) => void;
}) => {
	const bars = {
		durationInSeconds: 0,
	};
	let duration: number | null = null;

	const combinedBars: number[] = [];

	return {
		add: (frame: AudioBuffer) => {
			bars.durationInSeconds += frame.duration ?? 0;
			if (duration !== null) {
				const progress = bars.durationInSeconds / duration;
				const bar = Math.round(progress * AMOUNT_OF_BARS);
				const channelData = frame.getChannelData(0);

				while (combinedBars.length < bar) {
					const average =
						// * 4 is arbitrary, looks good though
						channelData.reduce((a, b) => a + Math.abs(b) * 4, 0) /
						channelData.length;
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
