export const getConflictingOutputPaths = (
	paths: string[],
): [string, string] | null => {
	const files = new Map<string, string>();
	for (const path of paths) {
		const key = path
			.normalize('NFD')
			.toLowerCase()
			.toUpperCase()
			.normalize('NFC');
		const existing = files.get(key);
		if (existing !== undefined) {
			return [existing, path];
		}

		files.set(key, path);
	}

	for (const [key, path] of files) {
		let slash = key.indexOf('/');
		while (slash !== -1) {
			const parentFile = files.get(key.slice(0, slash));
			if (parentFile !== undefined) {
				return [parentFile, path];
			}

			slash = key.indexOf('/', slash + 1);
		}
	}

	return null;
};
