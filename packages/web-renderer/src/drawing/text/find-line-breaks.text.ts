export function findLineBreaks(span: HTMLSpanElement): Array<{
	text: string;
	offsetTop: number;
}> {
	const textNode = span.childNodes[0] as Text;
	const originalText = textNode.textContent;

	const segmenter = new Intl.Segmenter('en', {granularity: 'word'});
	const segments = segmenter.segment(originalText);

	const words = Array.from(segments).map((s) => s.segment);
	const lines: Array<{text: string; offsetTop: number}> = [];

	let currentLine = '';
	let previousHeight = 0;
	let baselineTop: number | null = null;

	for (let i = 0; i < words.length; i += 1) {
		const word = words[i];
		const testText = currentLine ? `${currentLine}${word}` : word;

		textNode.textContent = testText;

		const rect = span.getBoundingClientRect();
		const currentHeight = rect.height;

		if (baselineTop === null) {
			baselineTop = rect.top;
			previousHeight = currentHeight;
			currentLine = testText;
			continue;
		}

		// If height changed significantly, we had a line break
		if (Math.abs(currentHeight - previousHeight) > 2 && previousHeight !== 0) {
			// The previous line is complete, measure it
			textNode.textContent = currentLine;

			lines.push({
				text: currentLine,
				offsetTop:
					currentHeight -
					previousHeight +
					(lines[lines.length - 1]?.offsetTop ?? 0),
			});

			// Start new line with current word
			currentLine = word;
			textNode.textContent = currentLine;

			const newRect = span.getBoundingClientRect();
			previousHeight = newRect.height;
		} else {
			currentLine = testText;
			previousHeight = currentHeight;
		}
	}

	// Add the last line
	if (currentLine) {
		textNode.textContent = currentLine;
		lines.push({
			text: currentLine,
			offsetTop: previousHeight + (lines[lines.length - 1]?.offsetTop ?? 0),
		});
	}

	const firstOffset = lines[0]?.offsetTop ?? 0;
	for (const line of lines) {
		line.offsetTop -= firstOffset;
	}

	// Reset to original text
	textNode.textContent = originalText;

	return lines;
}
