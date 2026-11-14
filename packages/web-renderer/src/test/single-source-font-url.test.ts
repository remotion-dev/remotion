import {expect, test} from 'vitest';
import {parseSingleSourceFontUrl} from '../drawing/parse-single-source-font-url';

test.each([
	['url("font.woff2")', 'font.woff2'],
	["url('font.woff2') format('woff2')", 'font.woff2'],
	['url(font.woff2) tech(variations)', 'font.woff2'],
	['url("font.woff2") format("woff2") tech(variations)', 'font.woff2'],
	['url("font.woff2") tech(variations, palettes)', 'font.woff2'],
	['URL("font.woff2") FORMAT("woff2") TECH(variations)', 'font.woff2'],
	[
		'url("data:font/woff2;base64,AAAA") format("woff2") tech(variations)',
		'data:font/woff2;base64,AAAA',
	],
	['url("font,one.woff2") tech(variations)', 'font,one.woff2'],
	['url("one.woff2"), url("two.woff2")', null],
	['url("one.woff2") tech(variations), url("two.woff2")', null],
	['local("Review"), url("font.woff2") tech(variations)', null],
	['url("font.woff2") tech(variations) tech(palettes)', null],
	['url("font.woff2") tech(variations) format("woff2")', null],
	['url("font.woff2") format("woff2") tech(variations', null],
	['url("font\\ name.woff2") tech(variations)', null],
])('parses the single font source %s', (src, expected) => {
	expect(parseSingleSourceFontUrl(src!)).toBe(expected);
});
