import {unquote} from './utils';

const getValue = (line: string) => {
	const name = line.match(/\:(.*)\;/)?.[1].trim();
	return unquote(name as string);
};

const getUrl = (line: string) => {
	const name = line.match(/url\((.*?)\)/)?.[1].trim();
	return name;
};

const parseFontFace = (block: string) => {
	const lines = block.split('\n');

	const ss = lines.find((line) => line.trim().startsWith('/*')) as string;

	const preliminarySubset = ss ? ss.match(/\/\*(.*)\*\//)![1].trim() : null;
	const fontFamily = getValue(
		lines.find((line) => line.trim().startsWith('font-family')) as string,
	);
	const src = getUrl(
		lines.find((line) => line.trim().startsWith('src')) as string,
	);
	const unicodeRangeLine = lines.find((line) =>
		line.trim().startsWith('unicode-range'),
	) as string;
	const unicodeRange = getValue(unicodeRangeLine);
	const weight = getValue(
		lines.find((line) => line.trim().startsWith('font-weight')) as string,
	);
	const style = getValue(
		lines.find((line) => line.trim().startsWith('font-style')) as string,
	);
	const stretchLine = lines.find((line) =>
		line.trim().startsWith('font-stretch'),
	);
	const stretch = stretchLine ? getValue(stretchLine) : null;

	const subset =
		preliminarySubset ?? '[' + src?.match(/\.([0-9]+)\.woff/)![1] + ']';

	if (!weight) throw Error('no weight');
	if (!subset) throw Error('no subset');
	if (!unicodeRange) throw Error('no unicodeRange');
	if (!src) throw Error('no src');

	return {fontFamily, src, unicodeRange, weight, style, stretch, subset};
};

export type FontInfo = {
	fontFamily: string;
	importName: string;
	version: string;
	url: string;
	unicodeRanges: Record<string, string>;
	fonts: Record<string, Record<string, Record<string, string>>>;
	subsets: string[];
	variable?: {
		axes: Record<string, {min: number; max: number}>;
		fontFaces: {
			style: string;
			weight: string;
			stretch: string | null;
			subset: string;
			unicodeRange: string;
			src: string;
		}[];
		url: string;
	};
};

export const extractVariableInfoFromCss = ({
	axes,
	contents,
	url,
}: {
	axes: {tag: string; start: number; end: number}[];
	contents: string;
	url: string;
}): NonNullable<FontInfo['variable']> => {
	let remainingContents = contents;
	const fontFaces: NonNullable<FontInfo['variable']>['fontFaces'] = [];

	while (
		remainingContents.match(/^\/\*(.*)/) ||
		remainingContents.match(/^\@font-face/)
	) {
		const endIndex = remainingContents.indexOf('}');
		const extractedContents = remainingContents.substring(
			0,
			endIndex === -1 ? Infinity : endIndex + 2,
		);
		remainingContents = remainingContents.substring(endIndex + 2).trim();
		const {subset, unicodeRange, style, src, stretch, weight} =
			parseFontFace(extractedContents);
		fontFaces.push({
			style,
			weight,
			stretch,
			subset,
			unicodeRange,
			src,
		});

		if (endIndex === -1) {
			break;
		}
	}

	return {
		axes: Object.fromEntries(
			axes.map((axis) => [
				axis.tag,
				{
					min: axis.start,
					max: axis.end,
				},
			]),
		),
		fontFaces,
		url,
	};
};

export const extractInfoFromCss = ({
	contents,
	fontFamily,
	importName,
	url,
	version,
	subsets,
}: {
	contents: string;
	fontFamily: string;
	importName: string;
	url: string;
	version: string;
	subsets: string[];
}): FontInfo => {
	let remainingContents = contents;

	let unicodeRanges: Record<string, string> = {};
	let fonts: Record<string, Record<string, Record<string, string>>> = {};

	while (
		remainingContents.match(/^\/\*(.*)/) ||
		remainingContents.match(/^\@font-face/)
	) {
		const startIndex = 0;
		const endIndex = remainingContents.indexOf('}');
		const extractedContents = remainingContents.substring(
			startIndex,
			endIndex === -1 ? Infinity : endIndex + 2,
		);
		remainingContents = remainingContents.substring(endIndex + 2).trim();
		const {subset, unicodeRange, style, src, weight} =
			parseFontFace(extractedContents);

		unicodeRanges[subset] = unicodeRange;
		fonts[style] ??= {};
		fonts[style][weight] ??= {};
		fonts[style][weight][subset] = src;

		if (endIndex === -1) {
			break;
		}
	}

	// Prepare info data
	const info: FontInfo = {
		fontFamily,
		importName,
		version,
		url,
		unicodeRanges,
		fonts,
		subsets,
	};
	return info;
};
