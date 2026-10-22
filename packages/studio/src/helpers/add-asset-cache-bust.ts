export const addAssetCacheBust = ({
	fetchedAt,
	src,
}: {
	fetchedAt: number;
	src: string;
}) => {
	if (src.startsWith('blob:')) {
		return src;
	}

	return `${src}${src.includes('?') ? '&' : '?'}date=${fetchedAt}`;
};
