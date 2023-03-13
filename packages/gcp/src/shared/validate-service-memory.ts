export const validateServiceMemory = (serviceMemory: unknown) => {
	if (typeof serviceMemory !== 'string') {
		throw new TypeError(
			`The 'memory' argument must be a string, but is ${JSON.stringify(
				serviceMemory
			)}`
		);
	}

	// Check if the service memory is a valid value for a GCP CLoud Run service
	if (!serviceMemory.match(/^(128Mi|256Mi|512Mi|1Gi|2Gi|4Gi|8Gi|16Gi|32Gi)$/)) {
		throw new Error(
			'The `serviceMemory` must match the RegExp `/^(128Mi|256Mi|512Mi|1Gi|2Gi|4Gi|8Gi|16Gi|32Gi)$/`. This means it may only be a valid GCP Cloud Run memory value. You passed: ' +
				serviceMemory +
				'. Check for invalid characters.'
		);
	}
};
