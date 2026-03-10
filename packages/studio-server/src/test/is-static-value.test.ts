import {expect, test} from 'bun:test';
import {isStaticValue} from '../preview-server/routes/can-update-sequence-props';
import {parseExpression} from './test-utils';

test('Static values should be detected as static', () => {
	expect(isStaticValue(parseExpression('42'))).toBe(true);
	expect(isStaticValue(parseExpression('"hello"'))).toBe(true);
	expect(isStaticValue(parseExpression('true'))).toBe(true);
	expect(isStaticValue(parseExpression('false'))).toBe(true);
	expect(isStaticValue(parseExpression('null'))).toBe(true);
	expect(isStaticValue(parseExpression('-1'))).toBe(true);
	expect(isStaticValue(parseExpression('[1, 2, 3]'))).toBe(true);
	expect(isStaticValue(parseExpression('{a: 1, b: "c"}'))).toBe(true);
	expect(isStaticValue(parseExpression('[]'))).toBe(true);
	expect(isStaticValue(parseExpression('{}'))).toBe(true);
});

test('Computed values should be detected as computed', () => {
	expect(isStaticValue(parseExpression('1 + 2'))).toBe(false);
	expect(isStaticValue(parseExpression('Math.random()'))).toBe(false);
	expect(isStaticValue(parseExpression('someVar'))).toBe(false);
	expect(isStaticValue(parseExpression('foo()'))).toBe(false);
	expect(isStaticValue(parseExpression('a ? b : c'))).toBe(false);
	// eslint-disable-next-line no-template-curly-in-string
	expect(isStaticValue(parseExpression('`template ${"x"}`'))).toBe(false);
});
