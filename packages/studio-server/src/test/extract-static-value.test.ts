import {expect, test} from 'bun:test';
import {extractStaticValue} from '../preview-server/routes/can-update-sequence-props';
import {parseExpression} from './test-utils';

test('extractStaticValue should extract values from AST nodes', () => {
	expect(extractStaticValue(parseExpression('42'))).toBe(42);
	expect(extractStaticValue(parseExpression('"hello"'))).toBe('hello');
	expect(extractStaticValue(parseExpression('true'))).toBe(true);
	expect(extractStaticValue(parseExpression('false'))).toBe(false);
	expect(extractStaticValue(parseExpression('null'))).toBe(null);
	expect(extractStaticValue(parseExpression('-1'))).toBe(-1);
	expect(extractStaticValue(parseExpression('[1, 2, 3]'))).toEqual([1, 2, 3]);
	expect(extractStaticValue(parseExpression('{a: 1, b: "c"}'))).toEqual({
		a: 1,
		b: 'c',
	});
	expect(extractStaticValue(parseExpression('[]'))).toEqual([]);
	expect(extractStaticValue(parseExpression('{}'))).toEqual({});
});
