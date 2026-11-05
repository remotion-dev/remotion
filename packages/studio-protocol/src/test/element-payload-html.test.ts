import {expect, test} from 'bun:test';
import {staticFileRef} from '../element-drag-data';
import {createElementPayload} from '../element-payload';
import {
	ELEMENT_PAYLOAD_MIME_TYPE,
	getElementPayloadScriptProps,
	parseElementPayloadsFromHtml,
	type ElementPayloadScriptProps,
} from '../element-payload-html';

const hostileSourceCode = [
	'// </script><script>alert(1)</script>',
	'// <!-- <script> --> & &amp; \u2028 \u2029 </SCRIPT >',
	'export const Hostile = () => <div>{"</script>"}</div>;',
].join('\n');

const hostilePayload = createElementPayload({
	displayName: 'Hostile </script> & <!-- Title',
	slug: 'hostile',
	sourceCode: hostileSourceCode,
	dependencies: [],
	dimensions: {width: 1920, height: 1080},
	durationInFrames: 60,
	initialProps: {label: '</script><!--\u2028\u2029&'},
});

const assetPayload = createElementPayload({
	displayName: 'Podcast Intro',
	slug: 'podcast-intro',
	sourceCode: 'export const PodcastIntro = () => null;',
	dependencies: [{name: '@remotion/media', version: null}],
	dimensions: null,
	durationInFrames: 150,
	assets: [
		{
			path: 'podcast-intro/music.mp3',
			type: 'url',
			url: 'https://cdn.example.com/music.mp3?a=1&b=2',
		},
	],
	initialProps: {audioUrl: staticFileRef('podcast-intro/music.mp3')},
});

// Mirrors how React renders <script {...props} /> on the server.
const renderScript = (props: ElementPayloadScriptProps) =>
	`<script type="${props.type}">${props.dangerouslySetInnerHTML.__html}</script>`;

const wrapInPage = (body: string) =>
	`<!doctype html><html><head><title>Library</title></head><body>${body}</body></html>`;

test('escapes characters that could end the script block or break JavaScript', () => {
	const props = getElementPayloadScriptProps(hostilePayload);
	const html = props.dangerouslySetInnerHTML.__html;

	expect(props.type).toBe(ELEMENT_PAYLOAD_MIME_TYPE);
	expect(html).not.toContain('<');
	expect(html).not.toContain('>');
	expect(html).not.toContain('&');
	expect(html).not.toContain('\u2028');
	expect(html).not.toContain('\u2029');
	expect(html).toContain('\\u003c/script\\u003e');
	expect(JSON.parse(html)).toEqual(hostilePayload);
});

test('round trips a payload through HTML', () => {
	const html = wrapInPage(
		renderScript(getElementPayloadScriptProps(hostilePayload)),
	);

	expect(parseElementPayloadsFromHtml(html)).toEqual({
		payloads: [hostilePayload],
		invalidPayloadCount: 0,
		alternateHrefs: [],
	});
});

test('reads every payload on a page in document order', () => {
	const html = wrapInPage(
		[
			'<script>window.x = "<!--";</script>',
			renderScript(getElementPayloadScriptProps(assetPayload)),
			'<script type="application/ld+json">{"@type":"Thing"}</script>',
			renderScript(getElementPayloadScriptProps(hostilePayload)),
		].join('\n'),
	);

	expect(parseElementPayloadsFromHtml(html).payloads).toEqual([
		assetPayload,
		hostilePayload,
	]);
});

test('accepts attribute variations that browsers accept', () => {
	const {__html} =
		getElementPayloadScriptProps(assetPayload).dangerouslySetInnerHTML;
	const html = wrapInPage(
		[
			`<SCRIPT TYPE='Application/Vnd.Remotion.Element+JSON' nonce="abc">${__html}</SCRIPT >`,
			`<script id=payload type=application/vnd.remotion.element+json>\n  ${__html}\n</script>`,
		].join(''),
	);

	expect(parseElementPayloadsFromHtml(html).payloads).toEqual([
		assetPayload,
		assetPayload,
	]);
});

test('ignores commented-out payloads', () => {
	const html = wrapInPage(
		`<!-- ${renderScript(getElementPayloadScriptProps(assetPayload))} -->`,
	);

	expect(parseElementPayloadsFromHtml(html)).toEqual({
		payloads: [],
		invalidPayloadCount: 0,
		alternateHrefs: [],
	});
});

test('counts invalid embedded payloads', () => {
	const html = wrapInPage(
		[
			`<script type="${ELEMENT_PAYLOAD_MIME_TYPE}">not json</script>`,
			`<script type="${ELEMENT_PAYLOAD_MIME_TYPE}">{"type":"remotion-element","version":3}</script>`,
			renderScript(getElementPayloadScriptProps(assetPayload)),
		].join(''),
	);

	expect(parseElementPayloadsFromHtml(html)).toEqual({
		payloads: [assetPayload],
		invalidPayloadCount: 2,
		alternateHrefs: [],
	});
});

test('collects alternate links for pages rendered in the browser', () => {
	const html = wrapInPage(
		[
			`<link rel="alternate" type="${ELEMENT_PAYLOAD_MIME_TYPE}" href="/elements/lower-third.json">`,
			`<link rel="Alternate nofollow" type="${ELEMENT_PAYLOAD_MIME_TYPE}" href="https://example.com/e.json?a=1&amp;b=2" />`,
			'<link rel="alternate" type="application/rss+xml" href="/feed.xml">',
			`<link rel="stylesheet" type="${ELEMENT_PAYLOAD_MIME_TYPE}" href="/no.json">`,
			`<link rel="alternate" type="${ELEMENT_PAYLOAD_MIME_TYPE}">`,
		].join(''),
	);

	expect(parseElementPayloadsFromHtml(html)).toEqual({
		payloads: [],
		invalidPayloadCount: 0,
		alternateHrefs: [
			'/elements/lower-third.json',
			'https://example.com/e.json?a=1&b=2',
		],
	});
});

test('rejects payloads that were not created with createElementPayload()', () => {
	expect(() =>
		getElementPayloadScriptProps(
			// @ts-expect-error Exercise runtime validation of invalid JavaScript inputs.
			{type: 'remotion-element', version: 1},
		),
	).toThrow(TypeError);
});
