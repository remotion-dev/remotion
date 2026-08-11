import {expect, test} from 'vitest';
import {
	createPageResponsivenessController,
	resolvePageResponsivenessInterval,
} from '../page-responsiveness';

test('should resolve page responsiveness presets', () => {
	expect(resolvePageResponsivenessInterval('disabled')).toBeNull();
	expect(resolvePageResponsivenessInterval('low')).toBe(100);
	expect(resolvePageResponsivenessInterval('medium')).toBe(33);
	expect(resolvePageResponsivenessInterval('high')).toBe(16);
	expect(resolvePageResponsivenessInterval(42)).toBe(42);
});

test('should reject invalid page responsiveness values', () => {
	expect(() => resolvePageResponsivenessInterval('fast')).toThrow(
		'"pageResponsiveness" must be one of "disabled", "low", "medium", "high", or a number, but got "fast"',
	);
	expect(() => resolvePageResponsivenessInterval(0)).toThrow(
		'"pageResponsiveness" must be greater than 0, but is 0',
	);
	expect(() => resolvePageResponsivenessInterval(Number.NaN)).toThrow(
		'`pageResponsiveness` should not be NaN, but is NaN',
	);
});

test('should wait after the page responsiveness interval has passed', async () => {
	let time = 0;
	let waits = 0;

	const controller = createPageResponsivenessController({
		intervalInMilliseconds: 100,
		now: () => time,
		wait: () => {
			waits++;
			return Promise.resolve();
		},
	});

	await controller.waitIfNeeded();
	expect(waits).toBe(0);

	time = 99;
	await controller.waitIfNeeded();
	expect(waits).toBe(0);

	time = 100;
	await controller.waitIfNeeded();
	expect(waits).toBe(1);

	time = 199;
	await controller.waitIfNeeded();
	expect(waits).toBe(1);

	time = 200;
	await controller.waitIfNeeded();
	expect(waits).toBe(2);
});

test('should not wait when page responsiveness is disabled', async () => {
	let waits = 0;

	const controller = createPageResponsivenessController({
		intervalInMilliseconds: null,
		now: () => 1000,
		wait: () => {
			waits++;
			return Promise.resolve();
		},
	});

	await controller.waitIfNeeded();
	await controller.waitIfNeeded();

	expect(waits).toBe(0);
});
