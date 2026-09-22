import {expect, test} from 'bun:test';
import {parseDragData} from '../drag-data';
import {setStudioDragData} from '../drag-transport';
import {parseElementDragData, staticFileRef} from '../element-drag-data';
import {
	createElementPayload,
	parseStudioElementPayload,
	type CreateElementPayloadInput,
} from '../element-payload';

const validInput = {
	dependencies: [
		{name: '@remotion/google-fonts', version: null},
		{name: 'lodash', version: '4.17.21'},
		{name: '@remotion/google-fonts', version: null},
	],
	dimensions: {width: 800, height: 200},
	displayName: 'Lower Third',
	durationInFrames: 90,
	initialProps: {
		captions: [{text: 'Hello', startMs: 0, endMs: 1000}],
		style: {color: 'red'},
	},
	slug: 'lower-third',
	sourceCode: 'export const LowerThird = () => null;',
	installationMode: 'component-owned-sequence',
} satisfies CreateElementPayloadInput;

const createInvalidPayload = (input: unknown) =>
	createElementPayload(input as CreateElementPayloadInput);

test('creates one canonical Element payload for HTTP and drag transports', () => {
	const payload = createElementPayload(validInput);
	expect(payload).toEqual({
		type: 'remotion-element',
		version: 1,
		durationInFrames: 90,
		element: {
			assets: [],
			dependencies: [
				{name: '@remotion/google-fonts', version: null},
				{name: 'lodash', version: '4.17.21'},
			],
			dimensions: {width: 800, height: 200},
			displayName: 'Lower Third',
			durationInFrames: 90,
			initialProps: {
				captions: [{text: 'Hello', startMs: 0, endMs: 1000}],
				style: {color: 'red'},
			},
			installationMode: 'component-owned-sequence',
			slug: 'lower-third',
			sourceCode: 'export const LowerThird = () => null;',
		},
	});
	expect(parseStudioElementPayload(payload)).toEqual(payload);

	const data = new Map<string, string>();
	const dataTransfer = {
		effectAllowed: 'none',
		setData: (type: string, value: string) => data.set(type, value),
	} as unknown as DataTransfer;
	setStudioDragData({dataTransfer, payload});

	expect(dataTransfer.effectAllowed).toBe('copy');
	const mimeType =
		'application/vnd.remotion.drag+json;v=1;type=element;width=800;height=200;duration=90';
	expect([...data.keys()]).toEqual([mimeType, 'text/plain']);
	expect(data.get('text/plain')).toBe(data.get(mimeType));
	expect(parseDragData({mimeType, payload: data.get(mimeType)!})).toMatchObject(
		{
			type: 'element',
			data: {
				element: {
					displayName: 'Lower Third',
					installationMode: 'component-owned-sequence',
				},
			},
			preview: {width: 800, height: 200, durationInFrames: 90},
		},
	);
});

test('validates asset payloads and references for both transports', () => {
	const payload = createElementPayload({
		...validInput,
		assets: [
			{
				path: 'my-element/logo.png',
				type: 'url',
				url: 'https://example.com/logo.png',
			},
			{path: 'my-element/data.json', type: 'base64', data: 'eyJvayI6dHJ1ZX0='},
		],
		initialProps: {media: [{src: staticFileRef('my-element/logo.png')}]},
	});
	const serialized = JSON.stringify(payload);
	expect(payload.version).toBe(2);
	expect(parseStudioElementPayload(JSON.parse(serialized))).toEqual(payload);
	expect(parseElementDragData(serialized)?.element).toEqual(payload.element);
	expect(parseStudioElementPayload({...payload, version: 1})).toBe(null);

	for (const assets of [
		[{path: '../logo.png', type: 'base64', data: 'AA=='}],
		[{path: 'logo.png', type: 'base64', data: 'not base64'}],
		[{path: 'logo.png', type: 'url', url: 'file:///logo.png'}],
		[
			{path: 'nested', type: 'base64', data: 'AA=='},
			{path: 'nested/logo.png', type: 'base64', data: 'AA=='},
		],
	] as const) {
		expect(() => createInvalidPayload({...validInput, assets})).toThrow();
	}

	for (const path of ['', '../logo.png', '/logo.png']) {
		expect(() => staticFileRef(path)).toThrow();
	}

	for (const ref of [
		staticFileRef('missing.png'),
		{__remotion_element_asset: '../logo.png'},
		{__remotion_element_asset: 123},
		{__remotion_element_asset: 'my-element/logo.png', extra: true},
	]) {
		const initialProps = {media: [{src: ref}]};
		expect(() =>
			createElementPayload({
				...validInput,
				assets: payload.element.assets,
				initialProps,
			}),
		).toThrow();
		const tampered = {...payload, element: {...payload.element, initialProps}};
		expect(parseStudioElementPayload(tampered)).toBeNull();
		expect(parseElementDragData(JSON.stringify(tampered))).toBeNull();
	}
});

test('defaults new Element payloads to wrapped installation', () => {
	const {installationMode: _installationMode, ...input} = validInput;
	const payload = createElementPayload(input);
	expect(payload.element.installationMode).toBe('wrapped');
});

test('normalizes legacy payloads without initial props or assets', () => {
	const payload = createElementPayload(validInput);
	const {
		initialProps: _initialProps,
		assets: _assets,
		...legacyElement
	} = payload.element;
	expect(
		parseStudioElementPayload({...payload, element: legacyElement}),
	).toMatchObject({version: 1, element: {initialProps: null, assets: []}});
});

test('rejects invalid and reserved initial props', () => {
	for (const initialProps of [
		{invalid: undefined},
		{invalid: Number.NaN},
		{'not-an-attribute': true},
		{captions: () => undefined},
		{from: 10},
		{style: 'color: red'},
	]) {
		expect(() => createInvalidPayload({...validInput, initialProps})).toThrow(
			/initialProps|initial props/,
		);
	}

	const payload = createElementPayload(validInput);
	for (const initialProps of [
		{invalid: undefined},
		{invalid: Number.NaN},
		{'not-an-attribute': true},
		{captions: () => undefined},
		{durationInFrames: 10},
		{style: 'color: red'},
	]) {
		expect(
			parseStudioElementPayload({
				...payload,
				element: {...payload.element, initialProps},
			}),
		).toBe(null);
	}
});

test('rejects an invalid installation mode from Studio payloads', () => {
	const payload = createElementPayload(validInput);
	expect(
		parseStudioElementPayload({
			...payload,
			element: {...payload.element, installationMode: 'no'},
		}),
	).toBe(null);
});

test('rejects invalid Element authoring input with actionable errors', () => {
	const cases: Array<{input: unknown; message: string}> = [
		{
			input: {...validInput, slug: '../unsafe'},
			message: 'slug must be a safe lowercase Element slug',
		},
		{
			input: {
				...validInput,
				sourceCode:
					'export const First = () => null; export const Second = () => null;',
			},
			message:
				'sourceCode must contain exactly one exported named React component',
		},
		{
			input: {...validInput, dependencies: ['@remotion/google-fonts']},
			message: 'Invalid Element dependency: "@remotion/google-fonts"',
		},
		{
			input: {
				...validInput,
				dependencies: [{name: 'lodash', version: null}],
			},
			message:
				'Non-Remotion Element dependency "lodash" must declare an exact version.',
		},
		{
			input: {
				...validInput,
				dependencies: [{name: 'lodash', version: '^4.17.21'}],
			},
			message:
				'Non-Remotion Element dependency "lodash" must declare an exact version.',
		},
		{
			input: {
				...validInput,
				dependencies: [{name: 'lodash', version: 'latest'}],
			},
			message:
				'Non-Remotion Element dependency "lodash" must declare an exact version.',
		},
		{
			input: {
				...validInput,
				dependencies: [{name: '@remotion/effects', version: '4.0.0'}],
			},
			message:
				'Remotion Element dependency "@remotion/effects" must use version: null.',
		},
		{
			input: {
				...validInput,
				dependencies: [{name: 'react', version: '19.0.0'}],
			},
			message:
				'"react" is provided by Remotion projects and must not be declared as an Element dependency.',
		},
		{
			input: {...validInput, dimensions: {width: 0, height: 200}},
			message: 'width and height must be numbers between 0 and 100000',
		},
		{
			input: {...validInput, durationInFrames: 0},
			message: 'durationInFrames must be an integer between 1 and 100000000',
		},
		{
			input: {...validInput, installationMode: 'no'},
			message:
				'installationMode must be "wrapped" or "component-owned-sequence"',
		},
	];

	for (const {input, message} of cases) {
		expect(() => createInvalidPayload(input)).toThrow(message);
	}
});
