const svgOpeningTag = /^<svg(?:\s|>)/i;

const removeSvgPreamble = (value: string) => {
	let remaining = value.trim();

	while (true) {
		const withoutPreamble = remaining
			.replace(/^<\?xml[\s\S]*?\?>\s*/i, '')
			.replace(/^<!doctype[\s\S]*?>\s*/i, '')
			.replace(/^<!--[\s\S]*?-->\s*/, '');
		if (withoutPreamble === remaining) {
			return remaining;
		}

		remaining = withoutPreamble;
	}
};

export const extractSvgMarkup = (value: string): string | null => {
	const withoutPreamble = removeSvgPreamble(value);
	if (!svgOpeningTag.test(withoutPreamble)) {
		return null;
	}

	const closingTagIndex = withoutPreamble.toLowerCase().lastIndexOf('</svg>');
	if (closingTagIndex === -1) {
		return null;
	}

	const afterClosingTag = withoutPreamble.slice(
		closingTagIndex + '</svg>'.length,
	);
	if (afterClosingTag.trim() !== '') {
		return null;
	}

	return withoutPreamble.slice(0, closingTagIndex + '</svg>'.length);
};

export const getClipboardSvgMarkup = (
	clipboardData: DataTransfer,
): string | null => {
	for (const mimeType of ['text/plain', 'text/html']) {
		const markup = extractSvgMarkup(clipboardData.getData(mimeType));
		if (markup !== null) {
			return markup;
		}
	}

	return null;
};

export const hasClipboardSvgMarkup = (clipboardData: DataTransfer) => {
	return getClipboardSvgMarkup(clipboardData) !== null;
};
