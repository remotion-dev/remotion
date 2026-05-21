type Token = {
	text: string;
	rect: DOMRect;
};

export const findWords = (span: HTMLSpanElement) => {
	const originalText = span.textContent;
	const segmenter = new Intl.Segmenter('en', {granularity: 'word'});
	const segments = segmenter.segment(span.textContent);
	const words = Array.from(segments).map((s) => s.segment);

	const tokens: Token[] = [];

	for (let i = 0; i < words.length; i++) {
		const wordsBefore = words.slice(0, i);
		const wordsAfter = words.slice(i + 1);
		const word = words[i];

		const wordsBeforeText = wordsBefore.join('');
		const wordsAfterText = wordsAfter.join('');

		const beforeNode = document.createTextNode(wordsBeforeText);
		const afterNode = document.createTextNode(wordsAfterText);
		const interstitialNode = document.createElement('span');
		interstitialNode.textContent = word;
		span.textContent = '';
		span.appendChild(beforeNode);
		span.appendChild(interstitialNode);
		span.appendChild(afterNode);

		const rect = interstitialNode.getBoundingClientRect();
		span.textContent = originalText;
		tokens.push({text: word, rect});
	}

	return tokens;
};
