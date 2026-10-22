export const isUrl = (value: string): boolean => {
	try {
		const parsed = new URL(value);
		return parsed.href.length > 0;
	} catch {
		return false;
	}
};

export const normalizeHttpUrl = (value: unknown): string | null => {
	if (typeof value !== 'string') {
		return null;
	}

	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
			? parsed.href
			: null;
	} catch {
		return null;
	}
};
