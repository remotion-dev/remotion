import {describe, expect, test} from 'bun:test';
import {calculateATempo} from '../assets/calculate-atempo';

describe('Calculate atempo', () => {
	test('Basic atempo', () => {
		expect(calculateATempo(0.5)).toBe('atempo=0.50000');
	});
	test('Below 0.5', () => {
		expect(calculateATempo(0.25)).toBe('atempo=0.50000,atempo=0.50000');
	});
	test('Above 2', () => {
		expect(calculateATempo(6)).toBe(
			'atempo=1.56508,atempo=1.56508,atempo=1.56508,atempo=1.56508',
		);
	});
	test('Extreme value', () => {
		expect(calculateATempo(0.0000001)).toBe(
			'atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430,atempo=0.60430',
		);
	});
});
