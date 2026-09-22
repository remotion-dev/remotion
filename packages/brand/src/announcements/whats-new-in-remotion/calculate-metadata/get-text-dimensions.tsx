import {measureText} from '@remotion/layout-utils';
import {fontFamily, fontSize, lineHeight, tabSize} from '../code-font';

export const getTextDimensions = (contents: string) => {
	const widthPerCharacter = measureText({
		text: 'A',
		fontFamily,
		fontSize,
		validateFontIsLoaded: true,
	}).width;

	const lines = contents.trimEnd().split('\n');

	const maxCharacters = Math.max(
		...lines
			.map((value) => value.replaceAll('\t', ' '.repeat(tabSize)).length)
			.flat(),
	);

	const codeWidth = widthPerCharacter * maxCharacters;
	return {width: codeWidth, height: lines.length * fontSize * lineHeight};
};
