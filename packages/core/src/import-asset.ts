// `importAsset` allows you to import assets such as PNG, MP4, MP3 etc.
// While this works well in Webpack, the files also get imported in Node to statically determine
// the compositions for rendering. For Node environments, we don't actually import MP4 files
// since Typescript will throw an error

export const importAsset = (id: string) => {
	if (process.release.name === 'node') {
		return undefined;
	}
	// eslint-disable-next-line import/no-dynamic-require
	return require(id);
};
