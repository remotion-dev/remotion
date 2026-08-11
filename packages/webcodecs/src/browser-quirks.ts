export const isFirefox = () => {
	return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
};

export const isSafari = () => {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isChrome = () => {
	return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};
