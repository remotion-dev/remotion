export const filterStaticFilesByQuery = <T extends {readonly name: string}>(
	files: readonly T[],
	query: string,
): T[] => {
	const normalized = query.trim().toLowerCase();
	if (normalized.length === 0) {
		return [...files];
	}

	return files.filter((file) => file.name.toLowerCase().includes(normalized));
};

export const getExpandedFoldersForFilteredAssets = (
	files: readonly {readonly name: string}[],
): Record<string, boolean> => {
	const expanded: Record<string, boolean> = {};

	for (const file of files) {
		const parts = file.name.split('/');
		let current = '';
		for (let i = 0; i < parts.length - 1; i++) {
			current = current ? `${current}/${parts[i]}` : parts[i];
			expanded[current] = true;
		}
	}

	return expanded;
};
