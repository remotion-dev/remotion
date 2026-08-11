export const warnAboutTooHighVolume = (volume: number) => {
	if (volume >= 100) {
		throw new Error(
			`Volume was set to ${volume}, but regular volume is 1, not 100. Did you forget to divide by 100? Set a volume of less than 100 to dismiss this error.`,
		);
	}
};
