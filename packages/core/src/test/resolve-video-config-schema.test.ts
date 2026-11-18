import {afterEach, beforeEach, expect, mock, spyOn, test} from 'bun:test';
import {z} from 'zod';
import {resolveVideoConfig} from '../resolve-video-config.js';
import * as v5Flag from '../v5-flag.js';

const schema = z.object({
	title: z.string(),
	color: z.object({r: z.number()}),
});

const resolveWithProps = (props: Record<string, unknown>) =>
	resolveVideoConfig({
		calculateMetadata: null,
		compositionDurationInFrames: 100,
		compositionFps: 30,
		compositionHeight: 1080,
		compositionId: 'my-comp',
		compositionWidth: 1920,
		defaultProps: {},
		inputProps: props,
		signal: new AbortController().signal,
		schema,
	});

let warn: ReturnType<typeof spyOn<Console, 'warn'>>;
const originalNodeEnv = window.process.env.NODE_ENV;

beforeEach(() => {
	warn = spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
	warn.mockRestore();
	window.process.env.NODE_ENV = originalNodeEnv;
});

test('warns about every invalid prop during rendering and resolves with the original props', async () => {
	const props = {title: 1, color: {r: 'red'}};

	const resolved = await resolveWithProps(props);

	expect(resolved.props).toEqual(props);
	expect(warn).toHaveBeenCalledTimes(1);
	const warning = warn.mock.calls[0].find((arg) => typeof arg === 'string');
	expect(warning).toStartWith(
		'The props of the composition "my-comp" do not match its schema:\n',
	);
	expect(warning).toContain('\n  - title: ');
	expect(warning).toContain('\n  - color.r: ');
	expect(warning).toContain('In Remotion 5.0, this will be an error.');
});

test('does not warn when not rendering or when the props match the schema', async () => {
	window.process.env.NODE_ENV = 'development';
	const invalidProps = {title: 1, color: {r: 'red'}};
	expect((await resolveWithProps(invalidProps)).props).toEqual(invalidProps);

	window.process.env.NODE_ENV = originalNodeEnv;
	const validProps = {title: 'Hello', color: {r: 255}};
	expect((await resolveWithProps(validProps)).props).toEqual(validProps);

	expect(warn).not.toHaveBeenCalled();
});

test('throws instead of warning with Remotion 5 breaking changes enabled', () => {
	mock.module('../v5-flag.js', () => ({
		...v5Flag,
		ENABLE_V5_BREAKING_CHANGES: true,
	}));
	try {
		expect(() => resolveWithProps({title: 1, color: {r: 255}})).toThrow(
			/The props of the composition "my-comp" do not match its schema:\n {2}- title: /,
		);
		expect(warn).not.toHaveBeenCalled();
	} finally {
		mock.module('../v5-flag.js', () => ({
			...v5Flag,
			ENABLE_V5_BREAKING_CHANGES: false,
		}));
	}
});
