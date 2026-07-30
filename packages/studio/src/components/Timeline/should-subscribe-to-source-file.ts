export const shouldSubscribeToSourceFile = (source: string): boolean => {
	const normalized = source.replaceAll('\\', '/');

	if (normalized === '..' || normalized.startsWith('../')) {
		return false;
	}

	return !normalized.split('/').includes('node_modules');
};
