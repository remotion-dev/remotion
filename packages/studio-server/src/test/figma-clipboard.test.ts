import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import * as recast from 'recast';
import {convertFigmaClipboardToSvg} from '../figma/figma-clipboard';
import {renderFigmaMessageToSvg} from '../figma/figma-to-svg';
import {svgMarkupToJsx} from '../helpers/svg-to-jsx';

const fixture = readFileSync(
	path.join(__dirname, 'fixtures', 'figma-payload.html'),
	'utf8',
);

test('converts the Figma clipboard fixture to one sanitized SVG', () => {
	const result = convertFigmaClipboardToSvg(fixture);
	expect(result.width).toBe(2000);
	expect(result.height).toBe(800);
	expect(result.svg).toStartWith(
		'<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="800" viewBox="0 0 2000 800">',
	);
	expect(result.svg).toContain(
		'<rect x="0" y="0" width="2000" height="800" fill="#2e2e2e" />',
	);
	expect(result.svg.match(/<path /g)).toHaveLength(18);
	expect(result.svg.match(/<mask /g)).toHaveLength(2);
	expect(result.svg.match(/<clipPath /g)).toHaveLength(1);
	expect(result.svg).toContain('stroke="#ffffff"');
	expect(result.svg).toContain('fill-opacity="0.3"');
	expect(result.svg).not.toContain('#000000');
	expect(result.svg).toContain('M 0 0 L 0 165.572021');
	expect(result.svg).toContain('M 0 0 L 0 123.692017');
	expect(result.svg).toContain('M 0 0 L 39.930054 0');
	expect(result.svg).toContain(
		'transform="matrix(1 0 0 1 749.694092 356.650085)"',
	);
	expect(result.svg).not.toContain('matrix(1 0 0 1 1238 817)');
	expect(result.svg).not.toMatch(/<script|<foreignObject|\shref=/);
});

test('converts the generated Figma SVG through the inline SVG pipeline', async () => {
	const {svg} = convertFigmaClipboardToSvg(fixture);
	const jsx = recast.print(await svgMarkupToJsx(svg)).code;
	expect(jsx).toStartWith('<svg');
	expect(jsx).toContain('<defs>');
	expect(jsx).toContain('<mask');
	expect(jsx).toContain('clipPath="url(#figma-clip-2)"');
	expect(jsx).toContain('fillRule="evenodd"');
	expect(jsx).toContain('strokeWidth={44.8018}');
});

test('rejects unsupported Figma features instead of approximating them', () => {
	expect(() =>
		renderFigmaMessageToSvg({
			message: {
				blobs: [],
				nodeChanges: [
					{
						fillPaints: [{type: 'GRADIENT_LINEAR', visible: true}],
						guid: {localID: 1, sessionID: 1},
						name: 'Gradient frame',
						size: {x: 100, y: 100},
						type: 'FRAME',
					},
				],
				type: 'NODE_CHANGES',
			},
			selectedNodeId: '1:1',
		}),
	).toThrow(
		'Cannot import Figma selection: “Gradient frame” uses an unsupported fill type',
	);
});

test('explains that pasted Figma images are unsupported', () => {
	expect(() =>
		renderFigmaMessageToSvg({
			message: {type: 'NODE_CHANGES'},
			selectedNodeId: '1:1',
		}),
	).toThrow(
		'Cannot import Figma selection: Pasting images from Figma is not supported',
	);
});

test('rejects malformed Figma clipboard envelopes clearly', () => {
	expect(() =>
		convertFigmaClipboardToSvg(
			'<span data-metadata="<!--(figmeta)e30=(/figmeta)-->"></span>',
		),
	).toThrow(
		'Cannot import Figma selection: clipboard is missing its figma section',
	);
});
