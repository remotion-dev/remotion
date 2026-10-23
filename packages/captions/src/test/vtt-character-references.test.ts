import {expect, test} from 'bun:test';
import {parseVtt} from '../parse-vtt';

const parseCueText = (cueText: string) => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
${cueText}
`;

	return parseVtt({input}).captions[0].text;
};

test('Should decode escaped ampersands and angle brackets', () => {
	expect(parseCueText('Tom &amp; Jerry')).toBe('Tom & Jerry');
	expect(parseCueText('1 &lt; 2 &gt; 0')).toBe('1 < 2 > 0');
});

test('Should decode other named character references', () => {
	expect(parseCueText('Hello&nbsp;World')).toBe('Hello\u00A0World');
	expect(parseCueText('&lrm;Hi&rlm;')).toBe('\u200EHi\u200F');
	expect(parseCueText('&quot;Hi&quot; &apos;there&apos;')).toBe(`"Hi" 'there'`);
});

test('Should decode numeric character references', () => {
	expect(parseCueText('Caf&#233;')).toBe('Caf\u00E9');
	expect(parseCueText('Caf&#xE9;')).toBe('Caf\u00E9');
	expect(parseCueText('&#x1F600;')).toBe('\u{1F600}');
});

test('Should decode character references only once', () => {
	expect(parseCueText('&amp;lt;b&amp;gt;')).toBe('&lt;b&gt;');
});

test('Should leave unknown or invalid references untouched', () => {
	expect(parseCueText('&unknown; &toString; & alone')).toBe(
		'&unknown; &toString; & alone',
	);
	expect(parseCueText('&#0; &#x110000; &#xD800;')).toBe(
		'&#0; &#x110000; &#xD800;',
	);
});

test('Should decode character references in multi-line cues', () => {
	expect(parseCueText('Rock &amp;\nRoll')).toBe('Rock &\nRoll');
});
