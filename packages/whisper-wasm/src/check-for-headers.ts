let headerWarningPrinted = false;

export const checkForHeaders = () => {
	if (!headerWarningPrinted && !crossOriginIsolated) {
		console.warn('please add the required headers, this may cause problems.');
		headerWarningPrinted = true;
	}
};
