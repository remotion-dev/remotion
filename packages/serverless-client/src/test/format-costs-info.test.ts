import {expect, test} from 'bun:test';
import {COSTS_DISCLAIMER, formatCostsInfo} from '../format-costs-info';

test('formats costs in USD by default and supports CNY', () => {
	expect(formatCostsInfo(1.234)).toEqual({
		accruedSoFar: 1.234,
		displayCost: '$1.234',
		currency: 'USD',
		disclaimer: COSTS_DISCLAIMER,
	});
	expect(formatCostsInfo(1.234, 'CNY')).toEqual({
		accruedSoFar: 1.234,
		displayCost: '¥1.234',
		currency: 'CNY',
		disclaimer: COSTS_DISCLAIMER,
	});
	expect(formatCostsInfo(0, 'CNY').displayCost).toBe('<¥0.001');
});
