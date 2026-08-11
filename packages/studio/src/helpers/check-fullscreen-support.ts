export const checkFullscreenSupport = () => {
	return (
		document.fullscreenEnabled ||
		// @ts-expect-error Types not defined
		document.webkitFullscreenEnabled
	);
};
