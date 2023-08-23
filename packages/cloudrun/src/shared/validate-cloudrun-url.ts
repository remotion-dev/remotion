export const validateCloudRunUrl = (cloudRunUrl: unknown) => {
	if (typeof cloudRunUrl !== 'string') {
		throw new TypeError(
			`"cloudRunUrl" parameter must be a string, but is ${JSON.stringify(
				cloudRunUrl,
			)}`,
		);
	}
};

// To improve this, we could add an endpoint within the image that returns some message to confirm that this is a Cloud Run url
