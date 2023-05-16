export const serviceVersionString = (version: string) => {
	return version.replace(/\./g, '-').replace(/\+/g, '-').substring(0, 10);
};
