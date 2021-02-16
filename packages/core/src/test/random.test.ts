import {random} from '../random';

test('Random should be deterministic', () => {
	expect(random(1)).toBe(random(1));
	expect(random(2)).toBe(random(2));
	expect(random(2)).not.toBe(random(1));
});

test('Random should be uniform', () => {
	const ITEM_COUNT = 10000;
	const mapped = new Array(ITEM_COUNT).fill(true).map((a, i) => {
		return random(i);
	});
	const average = mapped.reduce((a, b) => a + b, 0) / mapped.length;
	const tenthPercentile = mapped.filter((m) => m <= 0.1);
	const twentiethPercentile = mapped.filter((m) => m <= 0.2 && m >= 0.1);
	const ninetiethPercentile = mapped.filter((m) => m <= 0.9 && m >= 0.8);
	expect(average).toBeLessThan(0.501);
	expect(average).toBeGreaterThan(0.499);
	expect(tenthPercentile.length).toBeLessThan(ITEM_COUNT * 0.105);
	expect(tenthPercentile.length).toBeGreaterThan(ITEM_COUNT * 0.095);
	expect(twentiethPercentile.length).toBeLessThan(ITEM_COUNT * 0.105);
	expect(twentiethPercentile.length).toBeGreaterThan(ITEM_COUNT * 0.095);
	expect(ninetiethPercentile.length).toBeLessThan(ITEM_COUNT * 0.105);
	expect(ninetiethPercentile.length).toBeGreaterThan(ITEM_COUNT * 0.095);
});
