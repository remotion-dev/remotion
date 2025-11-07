// Round to only 4 digits, because WebM has a timescale of 1_000, e.g. framer.webm
export const roundTo4Digits = (timestamp: number) => {
	return Math.round(timestamp * 1_000) / 1_000;
};
