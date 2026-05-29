import {describe, it, expect} from 'bun:test';
import {scale} from '../scale.js';

describe('scale', () => {
	it('should accept valid params with scale only', () => {
		expect(() => scale({scale: 1.5})).not.toThrow();
	});

	it('should accept valid params with all params', () => {
		expect(() =>
			scale({scale: 2, horizontal: true, vertical: false}),
		).not.toThrow();
	});

	it('should accept valid params with non-uniform scaling', () => {
		expect(() =>
			scale({scale: 0.5, horizontal: false, vertical: true}),
		).not.toThrow();
	});

	it('should throw when scale is 0', () => {
		expect(() => scale({scale: 0})).toThrow();
	});

	it('should throw when scale is negative', () => {
		expect(() => scale({scale: -1})).toThrow();
	});

	it('should throw when horizontal is not a boolean', () => {
		const params = {scale: 1.5, horizontal: 'invalid'} as {
			scale: number;
			horizontal: string;
		};
		expect(() =>
			scale(params as unknown as Parameters<typeof scale>[0]),
		).toThrow();
	});

	it('should throw when vertical is not a boolean', () => {
		const params = {scale: 1.5, vertical: 'invalid'} as {
			scale: number;
			vertical: string;
		};
		expect(() =>
			scale(params as unknown as Parameters<typeof scale>[0]),
		).toThrow();
	});

	it('should throw when params is not an object', () => {
		const params = 'not an object';
		expect(() =>
			scale(params as unknown as Parameters<typeof scale>[0]),
		).toThrow();
	});

	it('should produce distinct effect keys for different parameters', () => {
		const uniform = scale({scale: 1.5});
		const horizontalOnly = scale({scale: 1.5, vertical: false});
		const verticalOnly = scale({scale: 1.5, horizontal: false});

		const uniformKey = uniform.effectKey;
		const horizontalOnlyKey = horizontalOnly.effectKey;
		const verticalOnlyKey = verticalOnly.effectKey;

		expect(uniformKey).not.toEqual(horizontalOnlyKey);
		expect(uniformKey).not.toEqual(verticalOnlyKey);
		expect(horizontalOnlyKey).not.toEqual(verticalOnlyKey);
	});

	it('should default to uniform scaling', () => {
		const uniform = scale({scale: 2});
		const explicit = scale({scale: 2, horizontal: true, vertical: true});

		expect(uniform.effectKey).toBe(explicit.effectKey);
	});
});
