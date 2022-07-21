export const DEFAULT_OUTPUT_LOCATION = 'out/video.mp4';

let currentOutputLocation: string = DEFAULT_OUTPUT_LOCATION;

export const setOutputLocation = (newOutputLocation: string) => {
	if (typeof newOutputLocation !== 'string') {
		throw new Error(
			`outputLocation must be a string but got ${typeof newOutputLocation} (${JSON.stringify(
				newOutputLocation
			)})`
		);
	}

	if (newOutputLocation === '') {
		throw new Error(`outputLocation must not be an empty string`);
	}

	currentOutputLocation = newOutputLocation;
};

export const getOutputLocation = () => currentOutputLocation;
