import {getCollapsedText} from './get-collapsed-text';

// Punctuation that cannot start a line according to Unicode line breaking rules
// When these would start a line, the browser moves the preceding word to the new line
const cannotStartLine = (segment: string): boolean => {
	if (segment.length === 0) return false;
	const firstChar = segment[0];
	const forbiddenLineStarts = [
		'.',
		',',
		';',
		':',
		'!',
		'?',
		')',
		']',
		'}',
		'"',
		"'",
		'"',
		`'`,
		'»',
		'…',
		'‥',
		'·',
		'%',
		'‰',
	];
	return forbiddenLineStarts.includes(firstChar);
};

export function findLineBreaks(
	span: HTMLSpanElement,
	rtl: boolean,
): Array<{
	text: string;
	height: number;
	offsetHorizontal: number;
}> {
	const textNode = span.childNodes[0] as Text;
	const originalText = textNode.textContent;
	textNode.textContent = '';
	const originalRect = span.getBoundingClientRect();

	const segmenter = new Intl.Segmenter('en', {granularity: 'word'});
	const segments = segmenter.segment(originalText);

	const words = Array.from(segments).map((s) => s.segment);

	const lines: Array<{
		text: string;
		height: number;
		offsetHorizontal: number;
	}> = [];

	let currentLine = '';
	let testText = '';
	let previousRect: DOMRect = originalRect;

	for (let i = 0; i < words.length; i += 1) {
		const word = words[i];
		let wordsToAdd = word;
		while (typeof words[i + 1] !== 'undefined' && wordsToAdd.trim() === '') {
			wordsToAdd += words[i + 1];
			i++;
		}

		previousRect = span.getBoundingClientRect();
		testText += wordsToAdd;
		const previousText = textNode.textContent;
		textNode.textContent = testText;
		const rect = span.getBoundingClientRect();
		const currentHeight = rect.height;

		const isLineBreak =
			previousRect &&
			previousRect.height !== 0 &&
			Math.abs(currentHeight - previousRect.height) > 2;

		const {collapsedText} = getCollapsedText({
			span,
			previousText,
			wordsToAdd,
			canCollapseStart: isLineBreak || lines.length === 0,
		});

		// If height changed significantly, we had a line break
		if (isLineBreak) {
			const offsetHorizontal = rtl
				? previousRect.right! - originalRect.right
				: previousRect.left! - originalRect.left;

			let textForPreviousLine = currentLine;
			let textForNewLine = collapsedText;

			// If the segment that triggered the break can't start a line (e.g., punctuation),
			// the browser would have moved the preceding word to the new line as well
			if (cannotStartLine(word)) {
				const currentLineSegments = Array.from(
					segmenter.segment(currentLine),
				).map((s) => s.segment);

				// Find the last non-whitespace segment (the word to move)
				let lastWordIndex = currentLineSegments.length - 1;
				while (
					lastWordIndex >= 0 &&
					currentLineSegments[lastWordIndex].trim() === ''
				) {
					lastWordIndex--;
				}

				if (lastWordIndex >= 0) {
					// Move the last word (and any trailing whitespace) to the new line
					textForPreviousLine = currentLineSegments
						.slice(0, lastWordIndex)
						.join('');
					textForNewLine =
						currentLineSegments.slice(lastWordIndex).join('') + collapsedText;
				}
			}

			lines.push({
				text: textForPreviousLine,
				height: currentHeight - previousRect.height,
				offsetHorizontal: 0,
			});

			currentLine = textForNewLine;
		} else {
			currentLine += collapsedText;
		}
	}

	// Add the last line
	if (currentLine) {
		textNode.textContent = testText;

		const rects = span.getClientRects();
		const rect = span.getBoundingClientRect();

		const lastRect = rects[rects.length - 1];

		const offsetHorizontal = rtl
			? lastRect.right - originalRect.right
			: lastRect.left - originalRect.left;

		lines.push({
			text: currentLine,
			height: rect.height - lines.reduce((acc, curr) => acc + curr.height, 0),
			offsetHorizontal: 0,
		});
	}

	// Reset to original text
	textNode.textContent = originalText;

	console.log({lines});
	return lines;
}
