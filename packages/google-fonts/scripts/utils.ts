import type {Font} from './google-fonts';

export const unquote = (str: string) =>
	str.replace(/^['"]/g, '').replace(/['"]$/g, '');

// Firefox does not support numbers in fontFamily
export const replaceDigitsWithWords = (str: string): string => {
	const numWords = [
		'Zero',
		'One',
		'Two',
		'Three',
		'Four',
		'Five',
		'Six',
		'Seven',
		'Eight',
		'Nine',
	];
	return str.replace(/\d/g, (digit) => numWords[parseInt(digit)]);
};

export const quote = (str: string) => `'${str}'`;

export const removeWhitespace = (str: string) => str.replace(/\s/g, '');

export const getCssLink = (font: Font) => {
	let url = 'https://fonts.googleapis.com/css2?family=';
	url += font.family.replace(/ /g, '+');
	url += ':ital,wght@';

	let tupleList: string[] = [];
	for (const variant of font.variants) {
		const weight = variant.match(/^(regular|italic)$/)
			? '400'
			: variant.replace(/italic/g, '');
		tupleList.push(`${Number(variant.endsWith('italic'))},${weight}`);
	}

	url += tupleList.sort().join(';');

	return url;
};

export const getVariableCssLink = (font: Font) => {
	if (!font.axes || font.axes.length === 0) {
		return null;
	}

	const hasItalic = font.variants.includes('italic');
	const hasNormal = font.variants.some(
		(variant) => !variant.endsWith('italic'),
	);
	const axes = font.axes
		.filter((axis) => axis.tag !== 'ital')
		.map((axis) => ({
			tag: axis.tag,
			value:
				axis.start === axis.end
					? String(axis.start)
					: `${axis.start}..${axis.end}`,
		}));
	if (hasItalic) {
		axes.push({tag: 'ital', value: ''});
	}

	axes.sort((a, b) => a.tag.localeCompare(b.tag, 'en-US'));
	const styles = hasItalic ? (hasNormal ? [0, 1] : [1]) : [null];
	const tuples = styles.map((italic) =>
		axes
			.map((axis) => (axis.tag === 'ital' ? String(italic) : axis.value))
			.join(','),
	);

	return `https://fonts.googleapis.com/css2?family=${font.family.replace(
		/ /g,
		'+',
	)}:${axes.map((axis) => axis.tag).join(',')}@${tuples.join(';')}`;
};
