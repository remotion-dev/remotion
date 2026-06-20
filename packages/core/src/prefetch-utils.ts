export const removeAndGetHashFragment = (src: string) => {
	const hashIndex = src.indexOf('#');
	if (hashIndex === -1) {
		return null;
	}

	return hashIndex;
};

export const getSrcWithoutHash = (src: string) => {
	const hashIndex = removeAndGetHashFragment(src);
	if (hashIndex === null) {
		return src;
	}

	return src.slice(0, hashIndex);
};
