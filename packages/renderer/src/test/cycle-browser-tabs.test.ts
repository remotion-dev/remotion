import {expect, test} from 'bun:test';
import {getTabCycleIntervalMs} from '../cycle-browser-tabs';

test('should not cycle if concurrency is <= 1', () => {
	expect(getTabCycleIntervalMs(1)).toBe(0);
});

test('should increase cycling frequency with higher concurrency', () => {
	expect(getTabCycleIntervalMs(2)).toBe(300);
	expect(getTabCycleIntervalMs(6)).toBe(100);
	expect(getTabCycleIntervalMs(12)).toBe(50);
});

test('should cap interval to avoid too infrequent cycles', () => {
	expect(getTabCycleIntervalMs(48)).toBe(20);
	expect(getTabCycleIntervalMs(200)).toBe(20);
});
