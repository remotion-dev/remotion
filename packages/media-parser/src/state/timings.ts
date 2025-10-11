export const timingsState = () => {
	return {
		timeIterating: 0,
		timeReadingData: 0,
		timeSeeking: 0,
		timeCheckingIfDone: 0,
		timeFreeingData: 0,
		timeInParseLoop: 0,
	};
};

export type TimingsState = ReturnType<typeof timingsState>;
