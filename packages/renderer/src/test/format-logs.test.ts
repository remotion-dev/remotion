import {expect, test} from 'vitest';
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
		'Date { Fri Jun 23 2023 10:19:49 GMT+0200 (Central European Summer Time) }'
	);
});
