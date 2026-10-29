import {expect, test} from 'bun:test';
import {parseVtt} from '../parse-vtt';

test('Should parse a basic WebVTT file', () => {
	const input = `WEBVTT

00:00:00.000 --> 00:00:02.500
Welcome to the Example WebVTT File!

00:00:03.000 --> 00:00:06.000
This is a demonstration of WebVTT subtitles.
`;

	expect(parseVtt({input}).captions).toEqual([
		{
			confidence: 1,
			endMs: 2500,
			startMs: 0,
			text: 'Welcome to the Example WebVTT File!',
			timestampMs: 1250,
		},
		{
			confidence: 1,
			endMs: 6000,
			startMs: 3000,
			text: 'This is a demonstration of WebVTT subtitles.',
			timestampMs: 4500,
		},
	]);
});

// Documents expected behavior. Valid WebVTT forbids `-->` in these blocks, so
// the generic skipping of non-timing lines would also produce this result.
test('Should ignore trailing text on the header line and header metadata', () => {
	const input = `WEBVTT - This file has a description
Kind: captions
Language: en

00:00:01.000 --> 00:00:02.000
Hello
`;

	expect(parseVtt({input}).captions).toEqual([
		{
			confidence: 1,
			endMs: 2000,
			startMs: 1000,
			text: 'Hello',
			timestampMs: 1500,
		},
	]);
});

test('Should parse a file without a WEBVTT header', () => {
	const input = `00:00:01.000 --> 00:00:02.000
Hello`;

	expect(parseVtt({input}).captions).toEqual([
		{
			confidence: 1,
			endMs: 2000,
			startMs: 1000,
			text: 'Hello',
			timestampMs: 1500,
		},
	]);
});

test('Should skip cue identifiers', () => {
	const input = `WEBVTT

intro
00:00:01.000 --> 00:00:02.000
Hello

2
00:00:03.000 --> 00:00:04.000
World
`;

	expect(parseVtt({input}).captions.map((c) => c.text)).toEqual([
		'Hello',
		'World',
	]);
});

test('Should support MM:SS.mmm timestamps and comma separators', () => {
	const input = `WEBVTT

01:02.500 --> 01:03,250
Short form
`;

	const [caption] = parseVtt({input}).captions;
	expect(caption.startMs).toBe(62500);
	expect(caption.endMs).toBe(63250);
});

test('Should parse timestamps with hours', () => {
	const input = `WEBVTT

01:00:00.000 --> 01:00:01.000
One hour in
`;

	const [caption] = parseVtt({input}).captions;
	expect(caption.startMs).toBe(3600000);
	expect(caption.endMs).toBe(3601000);
});

test('Should ignore cue settings', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000 align:start position:10% line:0
Positioned
`;

	expect(parseVtt({input}).captions).toEqual([
		{
			confidence: 1,
			endMs: 2000,
			startMs: 1000,
			text: 'Positioned',
			timestampMs: 1500,
		},
	]);
});

// Documents expected behavior. Valid WebVTT forbids `-->` in these blocks, so
// the generic skipping of non-timing lines would also produce this result.
test('Should skip NOTE, STYLE and REGION blocks', () => {
	const input = `WEBVTT

STYLE
::cue {
  color: yellow;
}

REGION
id:fred
width:40%

NOTE This is a comment
that spans two lines

NOTE
00:00:00.000 is not a cue here

00:00:01.000 --> 00:00:02.000
Hello
`;

	expect(parseVtt({input}).captions).toEqual([
		{
			confidence: 1,
			endMs: 2000,
			startMs: 1000,
			text: 'Hello',
			timestampMs: 1500,
		},
	]);
});

test('Should join multi-line cue text with newlines', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
First line
Second line
`;

	expect(parseVtt({input}).captions[0].text).toBe('First line\nSecond line');
});

test('Should handle a BOM and Windows line endings', () => {
	const input =
		'\uFEFFWEBVTT\r\n\r\n00:00:01.000 --> 00:00:02.000\r\nHello\r\n\r\n00:00:03.000 --> 00:00:04.000\r\nWorld\r\n';

	expect(parseVtt({input}).captions.map((c) => c.text)).toEqual([
		'Hello',
		'World',
	]);
});

test('Should return no captions for an empty file', () => {
	expect(parseVtt({input: 'WEBVTT\n'}).captions).toEqual([]);
	expect(parseVtt({input: ''}).captions).toEqual([]);
});

test('Should throw on an invalid timestamp', () => {
	const input = `WEBVTT

00:00:01 --> 00:00:02.000
Missing milliseconds
`;

	expect(() => parseVtt({input})).toThrow('Invalid timestamp');
});

test('Should not end a cue at a whitespace-only line (YouTube auto-generated captions)', () => {
	const input = `WEBVTT
Kind: captions
Language: en

00:00:00.160 --> 00:00:02.270 align:start position:0%
 
hey<00:00:00.480><c> everyone</c><00:00:00.880><c> welcome</c>

00:00:02.270 --> 00:00:02.280 align:start position:0%
hey everyone welcome
 

00:00:02.280 --> 00:00:04.990 align:start position:0%
hey everyone welcome
to<00:00:02.600><c> the</c><00:00:02.800><c> channel</c>
`;

	expect(parseVtt({input}).captions).toEqual([
		{
			confidence: 1,
			endMs: 2270,
			startMs: 160,
			text: 'hey everyone welcome',
			timestampMs: 1215,
		},
		{
			confidence: 1,
			endMs: 2280,
			startMs: 2270,
			text: 'hey everyone welcome',
			timestampMs: 2275,
		},
		{
			confidence: 1,
			endMs: 4990,
			startMs: 2280,
			text: 'hey everyone welcome\nto the channel',
			timestampMs: 3635,
		},
	]);
});

test('Should strip cue markup tags', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
<v.loud Esme Fitzgerald>It's a <i>blue</i> <b>apple</b> <u>tree</u>!</v>
<c.yellow.bg_blue>Yes</c> <lang en-US>really</lang> <ruby>漢<rt>kan</rt></ruby>
`;

	expect(parseVtt({input}).captions[0].text).toBe(
		"It's a blue apple tree!\nYes really 漢kan",
	);
});

test('Should decode character references', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
Tom &amp; Jerry &lt;3 &gt; &quot;cats&quot; &apos;n&apos;&nbsp;dogs&lrm;&rlm; &#169; &#x1F600; &#X41;
`;

	expect(parseVtt({input}).captions[0].text).toBe(
		'Tom & Jerry <3 > "cats" \'n\'\u00A0dogs\u200E\u200F © 😀 A',
	);
});

test('Should leave unknown or invalid character references untouched', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
&copy; &amp &#xZZ; &#99999999; &#0; &#xD800; & ;
`;

	expect(parseVtt({input}).captions[0].text).toBe(
		'&copy; &amp &#xZZ; &#99999999; &#0; &#xD800; & ;',
	);
});

test('Should not strip escaped tags', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
<b>Use &lt;i&gt; for italics</b>
`;

	expect(parseVtt({input}).captions[0].text).toBe('Use <i> for italics');
});

test('Should decode character references in a single pass', () => {
	const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
&amp;lt; &amp;amp; &amp;#65;
`;

	expect(parseVtt({input}).captions[0].text).toBe('&lt; &amp; &#65;');
});
