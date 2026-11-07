export const isFirefox = () => {
	return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

export const isSafari = () => {
	const {userAgent} = navigator;
	return (
		/AppleWebKit/.test(userAgent) &&
		!/Chrome\/|Chromium\/|Android/.test(userAgent)
	);
};

export const isChrome = () => {
	return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};
