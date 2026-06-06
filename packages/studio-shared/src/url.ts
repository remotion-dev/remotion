export const isUrl = (value: string): boolean => {
	try {
		const parsed = new URL(value);
		return parsed.href.length > 0;
	} catch {
		return false;
	}
};
