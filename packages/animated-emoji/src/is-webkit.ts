export const isWebkit = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const {userAgent} = window.navigator;
	return (
		/AppleWebKit/.test(userAgent) &&
		!/Chrome\/|Chromium\/|Android/.test(userAgent)
	);
};
