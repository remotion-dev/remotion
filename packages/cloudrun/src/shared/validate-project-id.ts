export const validateProjectID = (projectID: unknown) => {
	if (typeof projectID === 'undefined') {
		throw new TypeError(
			`The 'project-id' argument must be provided, but is missing.`,
		);
	}

	if (typeof projectID !== 'string') {
		throw new TypeError(
			`The 'project-id' argument must be a string, but is ${JSON.stringify(
				projectID,
			)}`,
		);
	}

	if (!projectID.match(/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g)) {
		throw new Error(
			'The `project-id` must match the RegExp `/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g`. This means it may only start with a letter, end with a letter or number, and contain up to 49 lowercase letters, numbers or hyphens. You passed: ' +
				projectID +
				'. Check for invalid characters.',
		);
	}
};
