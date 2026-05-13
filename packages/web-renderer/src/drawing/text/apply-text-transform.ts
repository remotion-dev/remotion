export const applyTextTransform = (text: string, transform: string): string => {
	if (transform === 'uppercase') {
		return text.toUpperCase();
	}

	if (transform === 'lowercase') {
		return text.toLowerCase();
	}

	if (transform === 'capitalize') {
		// CSS capitalize: uppercase first Letter/Number of each word, skipping leading punctuation/symbols
		return text.replace(
			/(^|\s)([^\p{L}\p{N}]*)(\p{L}|\p{N})/gu,
			(_, space, symbols, char) => space + symbols + char.toUpperCase(),
		);
	}

	return text;
};
