const ZERO_WIDTH_SPACE = '\u200B';

export const getCollapsedText = ({
	span,
	previousText,
	wordsToAdd,
	canCollapseStart,
}: {
	wordsToAdd: string;
	span: HTMLSpanElement;
	previousText: string;
	canCollapseStart: boolean;
}) => {
	const textNode = span.firstChild;

	if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
		throw new Error('Span must contain a single text node');
	}

	const originalText = (textNode as Text).textContent || '';

	const measureBox = (textToAddCandidate: string) => {
		(textNode as Text).textContent = previousText + textToAddCandidate;
		return span.getBoundingClientRect();
	};

	const measureWidth = (textToAddCandidate: string): number => {
		return measureBox(textToAddCandidate).width;
	};

	// Test leading whitespace
	if (/^\s/.test(wordsToAdd) && canCollapseStart) {
		const currentWidth = measureWidth(wordsToAdd);
		const newWidth = measureWidth(ZERO_WIDTH_SPACE + wordsToAdd.trimStart());

		if (newWidth === currentWidth) {
			// Whitespace was collapsed by the browser
			wordsToAdd = wordsToAdd.trimStart();
		}
	}

	// Test trailing whitespace (on current collapsed text)
	if (/\s$/.test(wordsToAdd)) {
		const currentWidth = measureWidth(wordsToAdd);
		const newWidth = measureWidth(wordsToAdd.trimEnd() + ZERO_WIDTH_SPACE);

		if (newWidth === currentWidth) {
			// Whitespace was collapsed by the browser
			wordsToAdd = wordsToAdd.trimEnd();
		}
	}

	// Test internal duplicate whitespace (on current collapsed text)
	if (/\s\s/.test(wordsToAdd)) {
		const currentWidth = measureWidth(wordsToAdd);
		const newWidth = measureWidth(wordsToAdd.replace(/\s\s+/g, ' '));

		if (newWidth === currentWidth) {
			// Whitespace was collapsed by the browser
			wordsToAdd = wordsToAdd.replace(/\s\s+/g, ' ');
		}
	}

	// Restore original text
	(textNode as Text).textContent = originalText;

	return {collapsedText: wordsToAdd};
};
