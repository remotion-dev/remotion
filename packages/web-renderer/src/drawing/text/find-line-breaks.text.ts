type Token = {
	text: string;
	rect: DOMRect;
};

const wordSegmenter = new Intl.Segmenter('en', {granularity: 'word'});

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

		const rect = interstitialNode.getBoundingClientRect();
		span.textContent = originalText;
		tokens.push({text: segment, rect});
	}

	return tokens;
};
