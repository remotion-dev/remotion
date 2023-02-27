export const validateServiceName = (serviceName: unknown) => {
	if (typeof serviceName === 'undefined') {
		// TODO - have a default service name, but also check GCP to see if it's already taken, and iterate
		// `gcloud run services list --project=projectID` can be used, but then this function needs to be aware of the project ID also
		throw new TypeError(
			`The 'serviceName' argument must be provided, but is missing.`
		);
	}

	if (typeof serviceName !== 'string') {
		throw new TypeError(
			`The 'serviceName' argument must be a string, but is ${JSON.stringify(
				serviceName
			)}`
		);
	}

	if (!serviceName.match(/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g)) {
		throw new Error(
			'The `serviceName` must match the RegExp `/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g`. This means it may only start with a letter, end with a letter or number, and contain up to 49 lowercase letters, numbers or hyphens. You passed: ' +
				serviceName +
				'. Check for invalid characters.'
		);
	}
};
