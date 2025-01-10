import {describe, expect, test} from 'bun:test';
import {getAbsoluteSrc} from '../absolute-src.js';

describe('Absolute src should behave as expected', () => {
	test('Get localhost:8080', () => {
		expect(getAbsoluteSrc('http://localhost:8080')).toBe(
			'http://localhost:8080/',
		);
	});
	test('Get localhost/hi', () => {
		expect(getAbsoluteSrc('/hi')).toBe('http://localhost:3000/hi');
	});
	test('Get data:base64', () => {
		expect(getAbsoluteSrc('data:base64,image/png,abc')).toBe(
			'data:base64,image/png,abc',
		);
	});
});
