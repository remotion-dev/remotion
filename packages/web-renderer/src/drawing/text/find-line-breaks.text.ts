type Token = {
	text: string;
	rect: DOMRect;
};

const wordSegmenter = new Intl.Segmenter('en', {granularity: 'word'});
const graphemeSegmenter = new Intl.Segmenter('en', {granularity: 'grapheme'});

export const findWords = (span: HTMLSpanElement) => {
	const originalText = span.textContent;
	const segments = Array.from(wordSegmenter.segment(originalText));

	const tokens: Token[] = [];

	for (const {index, segment} of segments) {
		const wordsBeforeText = originalText.slice(0, index);
		const wordsAfterText = originalText.slice(index + segment.length);

		const beforeNode = document.createTextNode(wordsBeforeText);
		const afterNode = document.createTextNode(wordsAfterText);
		const interstitialNode = document.createElement('span');
		interstitialNode.textContent = segment;
		span.textContent = '';
		span.appendChild(beforeNode);
		span.appendChild(interstitialNode);
		span.appendChild(afterNode);

		const rects = Array.from(interstitialNode.getClientRects());
		const wraps = rects.some((rect) => rect.top !== rects[0].top);
		if (wraps) {
			const textNode = interstitialNode.firstChild!;
			const range = document.createRange();
			let lineStart = 0;
			let lineTop: number | null = null;

			for (const {
				index: graphemeIndex,
				segment: grapheme,
			} of graphemeSegmenter.segment(segment)) {
				range.setStart(textNode, graphemeIndex);
				range.setEnd(textNode, graphemeIndex + grapheme.length);
				const rect = range.getBoundingClientRect();

				if (lineTop !== null && rect.top !== lineTop) {
					range.setStart(textNode, lineStart);
					range.setEnd(textNode, graphemeIndex);
					tokens.push({
						text: segment.slice(lineStart, graphemeIndex),
						rect: range.getBoundingClientRect(),
					});
					lineStart = graphemeIndex;
				}

				lineTop = rect.top;
			}

			range.setStart(textNode, lineStart);
			range.setEnd(textNode, segment.length);
			tokens.push({
				text: segment.slice(lineStart),
				rect: range.getBoundingClientRect(),
			});
		} else {
			tokens.push({
				text: segment,
				rect: interstitialNode.getBoundingClientRect(),
			});
		}

		span.textContent = originalText;
	}

	return tokens;
};
