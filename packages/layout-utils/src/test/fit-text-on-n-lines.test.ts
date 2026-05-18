import {expect, test} from 'vitest';
import {fitTextOnNLines} from '../layouts/fit-text-on-n-lines';
import {measureText} from '../layouts/measure-text';

const assertLinesFitBox = ({
	lines,
	maxBoxWidth,
	fontFamily,
	fontWeight,
	fontSize,
	textTransform,
}: {
	lines: string[];
	maxBoxWidth: number;
	fontFamily: string;
	fontWeight?: number | string;
	fontSize: number;
	textTransform?: 'uppercase' | 'none' | 'lowercase';
}) => {
	for (const line of lines) {
		const width = Math.ceil(
			measureText({
				text: line,
				fontFamily,
				fontWeight,
				fontSize,
				textTransform,
			}).width,
		);

		expect(width).toBeLessThanOrEqual(maxBoxWidth);
	}
};

test('issue #7359: long unbreakable word must not exceed maxBoxWidth on any line', () => {
	const maxBoxWidth = 756;
	const fontFamily = 'Verdana, sans-serif';
	const fontWeight = '900';
	const textTransform = 'uppercase' as const;

	const result = fitTextOnNLines({
		text: 'microtext  abcdefghijklmnopq',
		maxLines: 2,
		maxBoxWidth,
		maxFontSize: 80,
		fontFamily,
		fontWeight,
		textTransform,
	});

	expect(result.lines.length).toBeLessThanOrEqual(2);
	assertLinesFitBox({
		lines: result.lines,
		maxBoxWidth,
		fontFamily,
		fontWeight,
		fontSize: result.fontSize,
		textTransform,
	});
});

test('long URL-like token on second line still fits within maxBoxWidth', () => {
	const maxBoxWidth = 420;
	const fontFamily = 'Verdana, sans-serif';
	const fontWeight = '700';

	const result = fitTextOnNLines({
		text: 'short  https://example.com/very-long-path-segment-that-must-shrink',
		maxLines: 2,
		maxBoxWidth,
		maxFontSize: 48,
		fontFamily,
		fontWeight,
	});

	expect(result.lines.length).toBeLessThanOrEqual(2);
	assertLinesFitBox({
		lines: result.lines,
		maxBoxWidth,
		fontFamily,
		fontWeight,
		fontSize: result.fontSize,
	});
});
