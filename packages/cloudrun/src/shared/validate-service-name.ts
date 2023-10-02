export const validateServiceName = (serviceName: unknown) => {
	if (typeof serviceName !== 'string') {
		throw new TypeError(
			`"serviceName" parameter must be a string, but is ${JSON.stringify(
				serviceName,
			)}`,
		);
	}
};
