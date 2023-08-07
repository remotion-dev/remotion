import url from 'node:url';

export const resolveAssetSrc = (src: string) => {
	if (!src.startsWith('file:')) {
		return src;
	}

	const {protocol} = new URL(src);

	if (protocol === 'file:') return url.fileURLToPath(src);

	throw new TypeError(`Unexpected src ${src}`);
};
