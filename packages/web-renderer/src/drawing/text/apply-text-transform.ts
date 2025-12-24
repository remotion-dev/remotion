export const applyTextTransform = (text: string, transform: string): string => {
	if (transform === 'uppercase') {
		return text.toUpperCase();
	}

	if (transform === 'lowercase') {
		return text.toLowerCase();
	}

	if (transform === 'capitalize') {
		return text.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	return text;
};
