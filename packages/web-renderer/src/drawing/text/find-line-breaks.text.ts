type Token = {
	text: string;
	rect: DOMRect;
};

const measureRange = (textNode: Text, start: number, end: number) => {
	const range = document.createRange();
	range.setStart(textNode, start);
	range.setEnd(textNode, end);
	return range.getBoundingClientRect();
};

export const findWords = (span: HTMLSpanElement): Token[] => {
	const textNode = span.firstChild;
	if (!textNode || !(textNode instanceof Text)) {
		return [{text: span.textContent ?? '', rect: span.getBoundingClientRect()}];
	}

	const text = textNode.textContent ?? '';
	if (text.length === 0) {
		return [];
	}

	const wholeRange = document.createRange();
	wholeRange.setStart(textNode, 0);
	wholeRange.setEnd(textNode, text.length);
	const lineRects = Array.from(wholeRange.getClientRects());
	if (lineRects.length <= 1) {
		return [{text, rect: wholeRange.getBoundingClientRect()}];
	}

	const tokens: Token[] = [];
	let lineStart = 0;
	let currentTop = measureRange(textNode, 0, 1).top;
	for (let i = 1; i < text.length; i++) {
		const {top} = measureRange(textNode, i, i + 1);
		if (Math.abs(top - currentTop) > 1) {
			tokens.push({
				text: text.slice(lineStart, i),
				rect: measureRange(textNode, lineStart, i),
			});
			lineStart = i;
			currentTop = top;
		}
	}

	tokens.push({
		text: text.slice(lineStart),
		rect: measureRange(textNode, lineStart, text.length),
	});

	return tokens;
};
