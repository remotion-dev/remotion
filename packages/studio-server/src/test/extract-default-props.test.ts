import {expect, test} from 'bun:test';
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
