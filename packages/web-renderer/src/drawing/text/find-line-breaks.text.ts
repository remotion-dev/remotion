import {getCollapsedText} from './get-collapsed-text';

export function findLineBreaks(
	span: HTMLSpanElement,
	rtl: boolean,
): Array<{
	text: string;
	offsetTop: number;
	offsetHorizontal: number;
}> {
	const textNode = span.childNodes[0] as Text;
	const originalText = textNode.textContent;
	const originalRect = span.getBoundingClientRect();
	const computedStyle = getComputedStyle(span);

	const segmenter = new Intl.Segmenter('en', {granularity: 'word'});
	const segments = segmenter.segment(originalText);

	const words = Array.from(segments).map((s) => s.segment);

	const lines: Array<{
		text: string;
		offsetTop: number;
		offsetHorizontal: number;
	}> = [];

	let currentLine = '';
	let testText = '';
	let previousRect: DOMRect = originalRect;

	textNode.textContent = '';

	for (let i = 0; i < words.length; i += 1) {
		const _word = words[i];
		testText += _word;
		let wordsToAdd = _word;
		while (typeof words[i + 1] !== 'undefined' && words[i + 1].trim() === '') {
			testText += words[i + 1];
			wordsToAdd += words[i + 1];
			i++;
		}

		previousRect = span.getBoundingClientRect();
		textNode.textContent = testText;
		const collapsedText = getCollapsedText(span);
		textNode.textContent = collapsedText;
		const rect = span.getBoundingClientRect();
		const currentHeight = rect.height;

		// If height changed significantly, we had a line break
		if (
			previousRect &&
			previousRect.height !== 0 &&
			Math.abs(currentHeight - previousRect.height) > 2
		) {
			const offsetHorizontal = rtl
				? previousRect.right! - originalRect.right
				: previousRect.left! - originalRect.left;

			const shouldCollapse =
				!computedStyle.whiteSpaceCollapse.includes('preserve');

			lines.push({
				text: shouldCollapse ? currentLine.trim() : currentLine,
				offsetTop: currentHeight - previousRect.height,
				offsetHorizontal,
			});

			currentLine = wordsToAdd;
		} else {
			currentLine += wordsToAdd;
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
			offsetTop: rect.height - previousRect!.height,
			offsetHorizontal,
		});
	}

	// Reset to original text
	textNode.textContent = originalText;

	return lines;
}
