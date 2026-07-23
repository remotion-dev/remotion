import {expect, test} from 'bun:test';
import {Buffer} from 'node:buffer';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import * as recast from 'recast';
import {
	convertFigmaClipboardToSvg,
	getFigmaClipboardPasteSupportError,
} from '../figma/figma-clipboard';
import {renderFigmaMessageToSvg} from '../figma/figma-to-svg';
import {svgMarkupToJsx} from '../helpers/svg-to-jsx';

const fixture = readFileSync(
	path.join(__dirname, 'fixtures', 'figma-payload.html'),
	'utf8',
);
const selectNodeFromFixture = (selectedNodeId: string) => {
	return fixture.replace(
		/<!--\(figmeta\)([\s\S]*?)\(\/figmeta\)-->/,
		(_match, value: string) => {
			const metadata = JSON.parse(
				Buffer.from(value.replace(/[\t\n\r ]/g, ''), 'base64').toString('utf8'),
			) as Record<string, unknown>;
			return `<!--(figmeta)${Buffer.from(
				JSON.stringify({
					...metadata,
					selectedNodeData: `${selectedNodeId}|4|0`,
				}),
			).toString('base64')}(/figmeta)-->`;
		},
	);
};

const maskFreeFixture = selectNodeFromFixture('1941:116');

const solidPaint = (r: number, g: number, b: number) => ({
	color: {a: 1, b, g, r},
	type: 'SOLID',
	visible: true,
});

test('requires Node.js 22.15 or newer for native Zstandard support', () => {
	expect(getFigmaClipboardPasteSupportError(undefined)).toBe(
		'Figma paste is only available with Node.js 22.15 or newer',
	);
	expect(getFigmaClipboardPasteSupportError(() => undefined)).toBeNull();
});

test('rejects a Figma clipboard selection containing masks', () => {
	expect(() => convertFigmaClipboardToSvg(fixture)).toThrow(
		'Cannot import Figma selection: Pasting Figma selections with masks is not supported',
	);
});

test('converts a mask-free node from the Figma clipboard fixture', () => {
	const result = convertFigmaClipboardToSvg(maskFreeFixture);
	expect(result.width).toBe(119.7900390625);
	expect(result.height).toBe(123.6920166015625);
	expect(result.svg).toStartWith(
		'<svg xmlns="http://www.w3.org/2000/svg" width="119.790039" height="123.692017" viewBox="0 0 119.790039 123.692017">',
	);
	expect(result.svg.match(/<path /g)).toHaveLength(1);
	expect(result.svg).toContain('stroke="#ffffff"');
	expect(result.svg).not.toMatch(/<defs|<mask|<script|<foreignObject|\shref=/);
});

test('converts the generated Figma SVG through the inline SVG pipeline', async () => {
	const {svg} = convertFigmaClipboardToSvg(maskFreeFixture);
	const jsx = recast.print(await svgMarkupToJsx(svg)).code;
	expect(jsx).toStartWith('<svg');
	expect(jsx).not.toContain('<mask');
	expect(jsx).toContain('strokeWidth={44.8018}');
});

test('rejects a selected Figma mask node', () => {
	expect(() =>
		renderFigmaMessageToSvg({
			message: {
				blobs: [],
				nodeChanges: [
					{
						fillPaints: [solidPaint(1, 0, 0)],
						guid: {localID: 1, sessionID: 1},
						mask: true,
						name: 'Mask',
						size: {x: 100, y: 100},
						type: 'ROUNDED_RECTANGLE',
					},
				],
				type: 'NODE_CHANGES',
			},
			selectedNodeId: '1:1',
		}),
	).toThrow(
		'Cannot import Figma selection: Pasting Figma selections with masks is not supported',
	);
});

test('renders a full Figma ellipse as an SVG ellipse', async () => {
	const result = renderFigmaMessageToSvg({
		message: {
			blobs: [],
			nodeChanges: [
				{
					fillPaints: [solidPaint(1, 0, 0)],
					guid: {localID: 1, sessionID: 1},
					name: 'Ellipse',
					size: {x: 120, y: 80},
					type: 'ELLIPSE',
				},
			],
			type: 'NODE_CHANGES',
		},
		selectedNodeId: '1:1',
	});
	expect(result.svg).toContain(
		'<ellipse cx="60" cy="40" rx="60" ry="40" fill="#ff0000" />',
	);
	const jsx = recast.print(await svgMarkupToJsx(result.svg)).code;
	expect(jsx).toContain(
		'<ellipse cx={60} cy={40} rx={60} ry={40} fill="#ff0000" />',
	);
});

test('renders partial Figma ellipse arcs and full donuts', () => {
	const renderArc = (endingAngle: number) =>
		renderFigmaMessageToSvg({
			message: {
				blobs: [],
				nodeChanges: [
					{
						arcData: {endingAngle, innerRadius: 0.5, startingAngle: 0},
						fillPaints: [solidPaint(0, 1, 0)],
						guid: {localID: 1, sessionID: 1},
						name: 'Arc',
						size: {x: 200, y: 100},
						type: 'ELLIPSE',
					},
				],
				type: 'NODE_CHANGES',
			},
			selectedNodeId: '1:1',
		}).svg;

	expect(renderArc(Math.PI)).toContain(
		'<path d="M 200 50 A 100 50 0 0 1 0 50 L 50 50 A 50 25 0 0 0 150 50 Z" fill="#00ff00" fill-rule="evenodd" />',
	);
	expect(renderArc(Math.PI * 2)).toContain(
		'<path d="M 200 50 A 100 50 0 0 1 0 50 A 100 50 0 0 1 200 50 Z M 150 50 A 50 25 0 0 0 50 50 A 50 25 0 0 0 150 50 Z" fill="#00ff00" fill-rule="evenodd" />',
	);
});

test('clips inside-aligned Figma ellipse strokes', () => {
	const result = renderFigmaMessageToSvg({
		message: {
			blobs: [],
			nodeChanges: [
				{
					dashPattern: [2, 3],
					guid: {localID: 1, sessionID: 1},
					name: 'Stroked ellipse',
					size: {x: 100, y: 60},
					strokeAlign: 'INSIDE',
					strokeCap: 'ROUND',
					strokePaints: [solidPaint(0, 0, 1)],
					strokeWeight: 10,
					type: 'ELLIPSE',
				},
			],
			type: 'NODE_CHANGES',
		},
		selectedNodeId: '1:1',
	});
	expect(result.svg).toContain(
		'<clipPath id="figma-ellipse-stroke-0" clipPathUnits="userSpaceOnUse"><ellipse cx="50" cy="30" rx="50" ry="30" /></clipPath>',
	);
	expect(result.svg).toContain(
		'<ellipse cx="50" cy="30" rx="50" ry="30" fill="none" stroke="#0000ff" stroke-width="20" stroke-linecap="round" stroke-linejoin="miter" stroke-dasharray="2 3" />',
	);
});

test('renders a Figma rounded rectangle as an SVG rectangle', async () => {
	const result = renderFigmaMessageToSvg({
		message: {
			blobs: [],
			nodeChanges: [
				{
					cornerRadius: 20,
					fillPaints: [solidPaint(1, 0.5, 0)],
					guid: {localID: 1, sessionID: 1},
					name: 'Rounded rectangle',
					size: {x: 120, y: 80},
					type: 'ROUNDED_RECTANGLE',
				},
			],
			type: 'NODE_CHANGES',
		},
		selectedNodeId: '1:1',
	});
	expect(result.svg).toContain(
		'<rect x="0" y="0" width="120" height="80" rx="20" fill="#ff8000" />',
	);
	const jsx = recast.print(await svgMarkupToJsx(result.svg)).code;
	expect(jsx).toContain(
		'<rect x={0} y={0} width={120} height={80} rx={20} fill="#ff8000" />',
	);
});

test('preserves independent rounded rectangle corner radii', () => {
	const result = renderFigmaMessageToSvg({
		message: {
			blobs: [],
			nodeChanges: [
				{
					fillPaints: [solidPaint(0, 1, 1)],
					guid: {localID: 1, sessionID: 1},
					name: 'Independent corners',
					rectangleBottomLeftCornerRadius: 0,
					rectangleBottomRightCornerRadius: 40,
					rectangleCornerRadiiIndependent: true,
					rectangleTopLeftCornerRadius: 10,
					rectangleTopRightCornerRadius: 20,
					size: {x: 100, y: 60},
					type: 'ROUNDED_RECTANGLE',
				},
			],
			type: 'NODE_CHANGES',
		},
		selectedNodeId: '1:1',
	});
	expect(result.svg).toContain(
		'<path d="M 10 0 H 80 A 20 20 0 0 1 100 20 V 30 A 30 30 0 0 1 70 60 H 0 L 0 60 V 10 A 10 10 0 0 1 10 0 Z" fill="#00ffff" />',
	);
});

test('clips inside-aligned rounded rectangle strokes', () => {
	const result = renderFigmaMessageToSvg({
		message: {
			blobs: [],
			nodeChanges: [
				{
					cornerRadius: 12,
					guid: {localID: 1, sessionID: 1},
					name: 'Stroked rounded rectangle',
					size: {x: 100, y: 60},
					strokeAlign: 'INSIDE',
					strokePaints: [solidPaint(1, 0, 1)],
					strokeWeight: 5,
					type: 'ROUNDED_RECTANGLE',
				},
			],
			type: 'NODE_CHANGES',
		},
		selectedNodeId: '1:1',
	});
	expect(result.svg).toContain(
		'<clipPath id="figma-rounded-rectangle-stroke-0" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="100" height="60" rx="12" /></clipPath>',
	);
	expect(result.svg).toContain(
		'<rect x="0" y="0" width="100" height="60" rx="12" fill="none" stroke="#ff00ff" stroke-width="10" stroke-linecap="butt" stroke-linejoin="miter" />',
	);
});

test('rejects rounded rectangle features that cannot be preserved', () => {
	expect(() =>
		renderFigmaMessageToSvg({
			message: {
				blobs: [],
				nodeChanges: [
					{
						cornerRadius: 12,
						cornerSmoothing: 0.5,
						fillPaints: [solidPaint(1, 0, 0)],
						guid: {localID: 1, sessionID: 1},
						name: 'Smooth corners',
						size: {x: 100, y: 60},
						type: 'ROUNDED_RECTANGLE',
					},
				],
				type: 'NODE_CHANGES',
			},
			selectedNodeId: '1:1',
		}),
	).toThrow(
		'Cannot import Figma selection: “Smooth corners” uses unsupported corner smoothing',
	);

	expect(() =>
		renderFigmaMessageToSvg({
			message: {
				blobs: [],
				nodeChanges: [
					{
						borderBottomWeight: 2,
						borderLeftWeight: 1,
						borderRightWeight: 2,
						borderStrokeWeightsIndependent: true,
						borderTopWeight: 1,
						cornerRadius: 12,
						guid: {localID: 1, sessionID: 1},
						name: 'Independent borders',
						size: {x: 100, y: 60},
						strokePaints: [solidPaint(0, 0, 0)],
						type: 'ROUNDED_RECTANGLE',
					},
				],
				type: 'NODE_CHANGES',
			},
			selectedNodeId: '1:1',
		}),
	).toThrow(
		'Cannot import Figma selection: “Independent borders” uses unsupported independent stroke weights',
	);
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
