export const getAbsoluteSrc = (relativeSrc: string) => {
	return new URL(relativeSrc, window.location.origin).href;
};
