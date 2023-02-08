import { exec } from 'child_process';

export const validateProjectID = (projectID: unknown) => {
	if (typeof projectID === 'undefined') {
		throw new TypeError(
			`The 'projectID' argument must be provided, but is missing.`
		);
	}

	if (typeof projectID !== 'string') {
		throw new TypeError(
			`The 'projectID' argument must be a string, but is ${JSON.stringify(
				projectID
			)}`
		);
	}

	exec(`gcloud projects describe ${projectID}`,
		(error) => {
			if (error !== null) {
				throw new Error(`Project ID ${projectID} not found in GCP. It either does not exist, or you do not have access to it.`)
			} else {
				return
			}
		});

	if (!projectID.match(/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g)) {
		throw new Error(
			"The `projectID` must match the RegExp `/^[a-zA-Z][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$/g`. This means it may only start with a letter, end with a letter or number, and contain up to 49 lowercase letters, numbers or hyphens. You passed: " +
			projectID +
			'. Check for invalid characters.'
		);
	}
};
