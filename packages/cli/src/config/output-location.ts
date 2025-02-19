let currentOutputLocation: string | null = null;

export const setOutputLocation = (newOutputLocation: string) => {
	if (typeof newOutputLocation !== 'string') {
		throw new Error(
			`outputLocation must be a string but got ${typeof newOutputLocation} (${JSON.stringify(
				newOutputLocation,
			)})`,
		);
	}

	if (newOutputLocation.trim() === '') {
		throw new Error(`outputLocation must not be an empty string`);
	}

	currentOutputLocation = newOutputLocation;
};

export const getOutputLocation = () => currentOutputLocation;
