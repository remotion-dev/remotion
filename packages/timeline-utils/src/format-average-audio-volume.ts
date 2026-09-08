export const formatAverageAudioVolume = (volume: number | null) => {
	if (volume === null) {
		return 'Unavailable';
	}

	return volume === -Infinity
		? '−∞ dBFS (silent)'
		: `${volume.toFixed(1)} dBFS`;
};
