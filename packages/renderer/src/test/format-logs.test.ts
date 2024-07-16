import {expect, test} from 'bun:test';
import {formatObjectPreview} from '../format-logs';

process.env.NO_COLOR = '1';

test('Format logs with big object', () => {
	const result = formatObjectPreview({
		type: 'object',
		description: 'Object',
		overflow: false,
		properties: [{name: 'inputProps', type: 'object', value: 'Object'}],
	});

	expect(result).toBe('{ inputProps: {…} }');
});

test('Format logs with string', () => {
	const result = formatObjectPreview({
		type: 'object',
		description: 'Object',
		overflow: false,
		properties: [{name: 'a', type: 'string', value: 'b'}],
	});

	expect(result).toBe('{ a: "b" }');
});

test('Format accessor', () => {
	const result = formatObjectPreview({
		type: 'object',
		description: 'Object',
		overflow: false,
		properties: [{name: 'a', type: 'accessor'}],
	});

	expect(result).toBe('{ a: get() }');
});

test('Format date', () => {
	const result = formatObjectPreview({
		type: 'object',
		subtype: 'date',
		description:
			'Fri Jun 23 2023 10:19:49 GMT+0200 (Central European Summer Time)',
		overflow: false,
		properties: [],
	});

	expect(result).toBe(
		'Date { Fri Jun 23 2023 10:19:49 GMT+0200 (Central European Summer Time) }',
	);
});

test('Format large object', () => {
	const result = formatObjectPreview({
		type: 'object',
		description: 'Object',
		overflow: true,
		properties: [
			{name: 'hi', type: 'string', value: 'there'},
			{name: 'p', type: 'string', value: 'a'},
			{name: 'x', type: 'string', value: 'd'},
			{name: 'w', type: 'string', value: 'x'},
			{name: 'l', type: 'string', value: 'd'},
		],
	});

	expect(result).toBe('{ hi: "there", p: "a", x: "d", w: "x", l: "d", …}');
});

test("No '…' at the end of the log if overflow = false ", () => {
	const result = formatObjectPreview({
		type: 'object',
		description: 'Object',
		overflow: false,
		properties: [
			{name: 'hi', type: 'string', value: 'there'},
			{name: 'p', type: 'string', value: 'a'},
			{name: 'x', type: 'string', value: 'd'},
			{name: 'w', type: 'string', value: 'x'},
			{name: 'l', type: 'string', value: 'd'},
		],
	});

	expect(result).toBe('{ hi: "there", p: "a", x: "d", w: "x", l: "d" }');
});

test("Array overflow should end in '…]' ", () => {
	const result = formatObjectPreview({
		type: 'object',
		subtype: 'array',
		description: 'Array(1000)',
		overflow: true,
		properties: [
			{name: '0', type: 'boolean', value: 'true'},
			{name: '1', type: 'boolean', value: 'true'},
			{name: '2', type: 'boolean', value: 'true'},
		],
	});

	expect(result).toBe('[ true, true, true, …]');
});
