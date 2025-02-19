export const validateChannel = (channel: unknown, numberOfChannels: number) => {
	if (typeof channel !== 'number') {
		throw new TypeError(`"channel" must be a number`);
	}

	if (channel % 1 !== 0) {
		throw new TypeError(`"channel" must an integer, got ${channel}`);
	}

	if (Number.isNaN(channel)) {
		throw new TypeError(`The channel parameter is NaN.`);
	}

	if (channel < 0) {
		throw new TypeError('"channel" cannot be negative');
	}

	if (channel > numberOfChannels - 1) {
		throw new TypeError(
			`"channel" must be ${
				numberOfChannels - 1
			} or lower. The audio has ${numberOfChannels} channels`,
		);
	}
};
