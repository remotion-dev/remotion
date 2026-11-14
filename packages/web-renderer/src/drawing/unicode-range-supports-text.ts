export const unicodeRangeSupportsText = (
	unicodeRange: string | null,
	text: string,
): boolean => {
	if (unicodeRange === null) {
		return true;
	}

	const ranges = unicodeRange.split(',').map((range) => {
		const match = /^U\+([0-9A-F?]+)(?:-([0-9A-F]+))?$/i.exec(range.trim());
		if (!match) {
			return null;
		}

		return {
			from: Number.parseInt(match[1]!.replace(/\?/g, '0'), 16),
			to: Number.parseInt((match[2] ?? match[1]!).replace(/\?/g, 'F'), 16),
		};
	});

	if (ranges.some((range) => range === null)) {
		return true;
	}

	return Array.from(text).some((character) => {
		const codePoint = character.codePointAt(0)!;
		return ranges.some(
			(range) =>
				range !== null && codePoint >= range.from && codePoint <= range.to,
		);
	});
};
