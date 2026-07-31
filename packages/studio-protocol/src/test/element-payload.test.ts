import {expect, test} from 'bun:test';
import {parseDragData} from '../drag-data';
import {setStudioDragData} from '../drag-transport';
import {createElementPayload} from '../element-payload';

const validInput = {
	dependencies: ['remotion', 'remotion'],
	dimensions: {width: 800, height: 200},
	displayName: 'Lower Third',
	durationInFrames: 90,
	slug: 'lower-third',
	sourceCode: 'export const LowerThird = () => null;',
};

test('creates one canonical Element payload for HTTP and drag transports', () => {
	const payload = createElementPayload(validInput);
	expect(payload).toEqual({
		type: 'remotion-element',
		version: 1,
		durationInFrames: 90,
		element: {
			dependencies: ['remotion'],
			dimensions: {width: 800, height: 200},
			displayName: 'Lower Third',
			durationInFrames: 90,
			slug: 'lower-third',
			sourceCode: 'export const LowerThird = () => null;',
		},
	});

	const data = new Map<string, string>();
	const dataTransfer = {
		effectAllowed: 'none',
		setData: (type: string, value: string) => data.set(type, value),
	} as unknown as DataTransfer;
	setStudioDragData({dataTransfer, payload});

	expect(dataTransfer.effectAllowed).toBe('copy');
	const [mimeType] = data.keys();
	expect(mimeType).toBe(
		'application/vnd.remotion.drag+json;v=1;type=element;width=800;height=200;duration=90',
	);
	expect(
		parseDragData({mimeType: mimeType!, payload: data.get(mimeType!)!}),
	).toMatchObject({
		type: 'element',
		data: {element: {displayName: 'Lower Third'}},
		preview: {width: 800, height: 200, durationInFrames: 90},
	});
});

test('rejects invalid Element authoring input with actionable errors', () => {
	const cases: Array<{
		input: typeof validInput;
		message: string;
	}> = [
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
			input: {...validInput, dependencies: ['FS']},
			message: 'Invalid dependency package name: FS',
		},
		{
			input: {...validInput, dimensions: {width: 0, height: 200}},
			message: 'width and height must be numbers between 0 and 100000',
		},
		{
			input: {...validInput, durationInFrames: 0},
			message: 'durationInFrames must be an integer between 1 and 100000000',
		},
	];

	for (const {input, message} of cases) {
		expect(() => createElementPayload(input)).toThrow(message);
	}
});
