// Computed family lists retain CSS strings, including quoted commas and escapes.
export const parseFontFamilies = (value: string): string[] => {
	const families: string[] = [];
	let start = 0;
	let quote: string | null = null;
	for (let index = 0; index <= value.length; index++) {
		const character = value[index];
		if (character === '\\') {
			index++;
			continue;
		}

		if (quote !== null) {
			if (character === quote) quote = null;
			continue;
		}

		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}

		if (character !== ',' && index !== value.length) continue;
		const family = value
			.slice(start, index)
			.trim()
			.replace(/^(['"])(.*)\1$/, '$2');
		families.push(
			family
				.replace(
					/\\(?:([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?|([^\n\r\f]))/gi,
					(_match, hex: string | undefined, escaped: string | undefined) => {
						if (!hex) return escaped!;
						const codePoint = Number.parseInt(hex, 16);
						return String.fromCodePoint(
							codePoint === 0 ||
								codePoint > 0x10ffff ||
								(codePoint >= 0xd800 && codePoint <= 0xdfff)
								? 0xfffd
								: codePoint,
						);
					},
				)
				.toLowerCase(),
		);
		start = index + 1;
	}

	return families;
};

// FontFace.family can expose a decoded name or its serialized CSS string.
export const matchesFontFaceFamily = (exposed: string, family: string) => {
	if (exposed.toLowerCase() === family) return true;
	const quote = exposed[0];
	if ((quote !== '"' && quote !== "'") || exposed.at(-1) !== quote)
		return false;
	const parsed = parseFontFamilies(exposed);
	return parsed.length === 1 && parsed[0] === family;
};
