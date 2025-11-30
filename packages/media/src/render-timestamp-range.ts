export const renderTimestampRange = (timestamps: number[]): string => {
	if (timestamps.length === 0) {
		return '(none)';
	}

	if (timestamps.length === 1) {
		return timestamps[0].toFixed(3);
	}

	return `${timestamps[0].toFixed(3)}...${timestamps[timestamps.length - 1].toFixed(3)}`;
};
