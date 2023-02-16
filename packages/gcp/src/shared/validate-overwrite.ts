export const validateOverwrite = (overwriteService: unknown) => {
	if (overwriteService !== true && overwriteService !== false && overwriteService !== 'undefined') {
		throw new TypeError(
			`The 'overwrite-service' argument must be either true or false, or not included, but is ${JSON.stringify(
				overwriteService
			)}`
		);
	}
};
