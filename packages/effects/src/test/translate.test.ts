import {describe, expect, it} from 'bun:test';
import {uvTranslate, xyTranslate} from '../translate.js';

describe('xyTranslate', () => {
	it('should accept default params', () => {
		expect(() => xyTranslate()).not.toThrow();
	});

	it('should accept x and y offsets', () => {
		expect(() => xyTranslate({x: 120, y: -40})).not.toThrow();
	});

	it('should reject non-finite x offsets', () => {
		expect(() => xyTranslate({x: Number.NaN})).toThrow(
			'"x" must be a finite number',
		);
	});

	it('should reject non-finite y offsets', () => {
		expect(() => xyTranslate({y: Number.POSITIVE_INFINITY})).toThrow(
			'"y" must be a finite number',
		);
	});

	it('should produce distinct effect keys for different offsets', () => {
		const centered = xyTranslate();
		const shiftedX = xyTranslate({x: 10});
		const shiftedY = xyTranslate({y: 10});

		expect(
			new Set([centered.effectKey, shiftedX.effectKey, shiftedY.effectKey])
				.size,
		).toBe(3);
	});

	it('should default to no translation', () => {
		expect(xyTranslate().effectKey).toBe(xyTranslate({x: 0, y: 0}).effectKey);
	});
});

describe('uvTranslate', () => {
	it('should accept default params', () => {
		expect(() => uvTranslate()).not.toThrow();
	});

	it('should accept u and v offsets', () => {
		expect(() => uvTranslate({u: 0.25, v: -0.1})).not.toThrow();
	});

	it('should reject non-finite u offsets', () => {
		expect(() => uvTranslate({u: Number.NaN})).toThrow(
			'"u" must be a finite number',
		);
	});

	it('should reject non-finite v offsets', () => {
		expect(() => uvTranslate({v: Number.NEGATIVE_INFINITY})).toThrow(
			'"v" must be a finite number',
		);
	});

	it('should produce distinct effect keys for different offsets', () => {
		const centered = uvTranslate();
		const shiftedU = uvTranslate({u: 0.1});
		const shiftedV = uvTranslate({v: 0.1});

		expect(
			new Set([centered.effectKey, shiftedU.effectKey, shiftedV.effectKey])
				.size,
		).toBe(3);
	});

	it('should default to no translation', () => {
		expect(uvTranslate().effectKey).toBe(uvTranslate({u: 0, v: 0}).effectKey);
	});
});
