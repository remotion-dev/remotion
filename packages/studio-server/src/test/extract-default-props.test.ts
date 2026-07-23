import {expect, test} from 'bun:test';
import {NoReactInternals} from 'remotion/no-react';
import {computeCanUpdateDefaultPropsFromContent} from '../preview-server/routes/can-update-default-props';
import {
	extractStaticValue,
	isStaticValue,
} from '../preview-server/routes/can-update-sequence-props';
import {parseExpression} from './test-utils';

test('TSAsExpression values should be detected as static', () => {
	expect(isStaticValue(parseExpression("'a' as const"))).toBe(true);
	expect(isStaticValue(parseExpression('42 as const'))).toBe(true);
	expect(isStaticValue(parseExpression('true as const'))).toBe(true);
});

test('TSAsExpression values should be extracted correctly', () => {
	expect(extractStaticValue(parseExpression("'a' as const"))).toBe('a');
	expect(extractStaticValue(parseExpression('42 as const'))).toBe(42);
	expect(extractStaticValue(parseExpression('true as const'))).toBe(true);
});

test('Objects containing TSAsExpression values should be static', () => {
	expect(
		isStaticValue(parseExpression("{dropdown: 'a' as const, count: 5}")),
	).toBe(true);
});

test('Objects containing TSAsExpression values should be extracted', () => {
	expect(
		extractStaticValue(parseExpression("{dropdown: 'a' as const, count: 5}")),
	).toEqual({dropdown: 'a', count: 5});
});

test('Arrays containing TSAsExpression values should be static', () => {
	expect(
		isStaticValue(parseExpression("[{type: 'a' as const, a: {a: 'hi'}}]")),
	).toBe(true);
});

test('Arrays containing TSAsExpression values should be extracted', () => {
	expect(
		extractStaticValue(parseExpression("[{type: 'a' as const, a: {a: 'hi'}}]")),
	).toEqual([{type: 'a', a: {a: 'hi'}}]);
});

test('Nested TSAsExpression inside complex defaultProps should work', () => {
	const code = `{
		title: 'sdasds',
		delay: 5.2,
		color: '#df822a',
		list: [{name: 'first', age: 12}],
		matrix: [0, 1, 1, 0],
		description: 'Sample description',
		dropdown: 'a' as const,
		superSchema: [
			{type: 'a' as const, a: {a: 'hi'}},
			{type: 'b' as const, b: {b: 'hi'}},
		],
		discriminatedUnion: {type: 'auto'},
		tuple: ['foo', 42, {a: 'hi'}],
	}`;
	expect(isStaticValue(parseExpression(code))).toBe(true);
	const extracted = extractStaticValue(parseExpression(code));
	expect(extracted).toEqual({
		title: 'sdasds',
		delay: 5.2,
		color: '#df822a',
		list: [{name: 'first', age: 12}],
		matrix: [0, 1, 1, 0],
		description: 'Sample description',
		dropdown: 'a',
		superSchema: [
			{type: 'a', a: {a: 'hi'}},
			{type: 'b', b: {b: 'hi'}},
		],
		discriminatedUnion: {type: 'auto'},
		tuple: ['foo', 42, {a: 'hi'}],
	});
});

test('staticFile() should not be static by default', () => {
	expect(isStaticValue(parseExpression("staticFile('dialogue.wav')"))).toBe(
		false,
	);
});

test('staticFile() should be static when special values are allowed', () => {
	expect(
		isStaticValue(parseExpression("staticFile('dialogue.wav')"), {
			allowSpecialValues: true,
		}),
	).toBe(true);
	expect(
		extractStaticValue(parseExpression("staticFile('dialogue.wav')"), {
			allowSpecialValues: true,
		}),
	).toBe(`${NoReactInternals.FILE_TOKEN}dialogue.wav`);
});

test('staticFile() with special characters should be encoded like staticFile() at runtime', () => {
	expect(
		extractStaticValue(
			parseExpression("staticFile('my folder/voice #1.wav')"),
			{
				allowSpecialValues: true,
			},
		),
	).toBe(`${NoReactInternals.FILE_TOKEN}my%20folder/voice%20%231.wav`);
});

test('staticFile() with non-literal argument should not be static', () => {
	expect(
		isStaticValue(parseExpression('staticFile(myVariable)'), {
			allowSpecialValues: true,
		}),
	).toBe(false);
});

test('new Date() should be static when special values are allowed', () => {
	expect(
		isStaticValue(parseExpression("new Date('2024-01-01T00:00:00.000Z')"), {
			allowSpecialValues: true,
		}),
	).toBe(true);
	expect(
		extractStaticValue(
			parseExpression("new Date('2024-01-01T00:00:00.000Z')"),
			{
				allowSpecialValues: true,
			},
		),
	).toBe(`${NoReactInternals.DATE_TOKEN}2024-01-01T00:00:00.000Z`);
});

test('Objects containing staticFile() should be extracted', () => {
	const code = `{
audioFileUrl: staticFile("dialogue.wav"),
titleText: "Ep 550",
numberOfSamples: "64" as const,
}`;
	expect(isStaticValue(parseExpression(code), {allowSpecialValues: true})).toBe(
		true,
	);
	expect(
		extractStaticValue(parseExpression(code), {allowSpecialValues: true}),
	).toEqual({
		audioFileUrl: `${NoReactInternals.FILE_TOKEN}dialogue.wav`,
		titleText: 'Ep 550',
		numberOfSamples: '64',
	});
});

test('Audiogram-like root file should be extractable', () => {
	const content = `
import { Composition, staticFile } from "remotion";
import { Audiogram } from "./Audiogram/Main";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Audiogram"
      component={Audiogram}
      width={1080}
      height={1080}
      defaultProps={{
        audioOffsetInSeconds: 0,
        audioFileUrl: staticFile("dialogue.wav"),
        coverImageUrl: staticFile("podcast-cover.jpeg"),
        titleText: "Ep 550 - Supper Club × Remotion React",
        captions: null,
        onlyDisplayCurrentSentence: true,
        visualizer: {
          type: "oscilloscope",
          numberOfSamples: "64" as const,
          windowInSeconds: 0.1,
        },
      }}
    />
  );
};
`;
	const result = computeCanUpdateDefaultPropsFromContent(content, 'Audiogram');
	expect(result).toEqual({
		canUpdate: true,
		currentDefaultProps: {
			audioOffsetInSeconds: 0,
			audioFileUrl: `${NoReactInternals.FILE_TOKEN}dialogue.wav`,
			coverImageUrl: `${NoReactInternals.FILE_TOKEN}podcast-cover.jpeg`,
			titleText: 'Ep 550 - Supper Club × Remotion React',
			captions: null,
			onlyDisplayCurrentSentence: true,
			visualizer: {
				type: 'oscilloscope',
				numberOfSamples: '64',
				windowInSeconds: 0.1,
			},
		},
	});
});
