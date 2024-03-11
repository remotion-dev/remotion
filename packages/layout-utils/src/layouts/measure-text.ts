type Dimensions = {
	width: number;
	height: number;
};

export type Word = {
	text: string;
	fontFamily: string;
	fontSize: number | string;
	fontWeight?: number | string;
	letterSpacing?: string;
	fontVariantNumeric?: string;
};

const wordCache = new Map<string, Dimensions>();

export const measureText = ({
	text,
	fontFamily,
	fontSize,
	fontWeight,
	letterSpacing,
	fontVariantNumeric,
}: Word): Dimensions => {
	const key = `${text}-${fontFamily}-${fontWeight}-${fontSize}-${letterSpacing}`;

	if (wordCache.has(key)) {
		return wordCache.get(key) as Dimensions;
	}

	const node = document.createElement('span');

	node.style.fontFamily = fontFamily;
	node.style.display = 'inline-block';
	node.style.position = 'absolute';
	node.style.top = `-10000px`;
	node.style.whiteSpace = 'pre';
	node.style.fontSize =
		typeof fontSize === 'string' ? fontSize : `${fontSize}px`;

	if (fontWeight) {
		node.style.fontWeight = fontWeight.toString();
	}

	if (letterSpacing) {
		node.style.letterSpacing = letterSpacing;
	}

	if (fontVariantNumeric) {
		node.style.fontVariantNumeric = fontVariantNumeric;
	}

	node.innerText = text;

	document.body.appendChild(node);
	const boundingBox = node.getBoundingClientRect();
	document.body.removeChild(node);

	const result = {height: boundingBox.height, width: boundingBox.width};
	wordCache.set(key, result);
	return result;
};
