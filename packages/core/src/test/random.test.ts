import {random} from '../random';

test('Should support negative random numbers', () => {
	expect(random(-1)).toBe(random(-1));
	expect(random(-2)).toBe(random(-2));
	expect(random(-2)).not.toBe(random(-1));
});

test('Random should be deterministic', () => {
	expect(random(1)).toBe(random(1));
	expect(random(2)).toBe(random(2));
	expect(random(2)).not.toBe(random(1));
	expect(random(null)).not.toBe(random(null));
});

test('Random should be uniform', () => {
	const ITEM_COUNT = 100000;
	const mapped = new Array(ITEM_COUNT).fill(true).map((a, i) => {
		return random(i);
	});

	const average = mapped.reduce((a, b) => a + b, 0) / mapped.length;

	const tenthPercentile = mapped.filter(m => m <= 0.1);
	const twentiethPercentile = mapped.filter(m => m <= 0.2 && m >= 0.1);
	const ninetiethPercentile = mapped.filter(m => m <= 0.9 && m >= 0.8);
	expect(average).toBeLessThan(0.51);
	expect(average).toBeGreaterThan(0.49);
	expect(tenthPercentile.length).toBeLessThan(ITEM_COUNT * 0.105);
	expect(tenthPercentile.length).toBeGreaterThan(ITEM_COUNT * 0.095);
	expect(twentiethPercentile.length).toBeLessThan(ITEM_COUNT * 0.105);
	expect(twentiethPercentile.length).toBeGreaterThan(ITEM_COUNT * 0.095);
	expect(ninetiethPercentile.length).toBeLessThan(ITEM_COUNT * 0.105);
	expect(ninetiethPercentile.length).toBeGreaterThan(ITEM_COUNT * 0.095);

	const distances = mapped
		.map((a, i) => {
			if (i === 0) {
				return null;
			}

			return Math.abs(mapped[i] - mapped[i - 1]);
		})
		.filter(f => f !== null) as number[];
	const averageDistance =
		distances.reduce((a, b) => a + b, 0) / distances.length;
	expect(averageDistance).toBeGreaterThan(0.3);
});

test('Random string should be uniform', () => {
	const alphabet = 'abcdefghijlkmnopqrstuvwxyz0123456789';
	const array = new Array(alphabet.length)
		.fill(true)
		.map((_, i) => random(alphabet[i]));
	const average = array.reduce((a, b) => a + b, 0) / array.length;
	expect(average).toBeLessThan(0.55);
	expect(average).toBeGreaterThan(0.45);
});
