export const getCollapsedText = (span: HTMLSpanElement): string => {
	const textNode = span.firstChild;

	if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
		throw new Error('Span must contain a single text node');
	}

	const originalText = (textNode as Text).textContent || '';
	let collapsedText = originalText;

	// Helper to measure width
	const measureWidth = (text: string): number => {
		(textNode as Text).textContent = text;
		return span.getBoundingClientRect().width;
	};

	const originalWidth = measureWidth(originalText);

	// Test leading whitespace
	if (/^\s/.test(collapsedText)) {
		const trimmedLeading = collapsedText.replace(/^\s+/, '');
		const newWidth = measureWidth(trimmedLeading);

		if (newWidth === originalWidth) {
			// Whitespace was collapsed by the browser
			collapsedText = trimmedLeading;
		}
	}

	// Test trailing whitespace (on current collapsed text)
	if (/\s$/.test(collapsedText)) {
		const currentWidth = measureWidth(collapsedText);
		const trimmedTrailing = collapsedText.replace(/\s+$/, '');
		const newWidth = measureWidth(trimmedTrailing);

		if (newWidth === currentWidth) {
			// Whitespace was collapsed by the browser
			collapsedText = trimmedTrailing;
		}
	}

	// Test internal duplicate whitespace (on current collapsed text)
	if (/\s\s/.test(collapsedText)) {
		const currentWidth = measureWidth(collapsedText);
		const collapsedInternal = collapsedText.replace(/\s\s+/g, ' ');
		const newWidth = measureWidth(collapsedInternal);

		if (newWidth === currentWidth) {
			// Whitespace was collapsed by the browser
			collapsedText = collapsedInternal;
		}
	}

	// Restore original text
	(textNode as Text).textContent = originalText;

	return collapsedText;
};
