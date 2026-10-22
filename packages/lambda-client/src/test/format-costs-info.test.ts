import {expect, test} from 'bun:test';
import {formatCostsInfo} from '../format-costs-info';

test('formats costs in USD by default and supports CNY', () => {
	expect(formatCostsInfo(1.234)).toEqual({
		accruedSoFar: 1.234,
		displayCost: '$1.234',
		currency: 'USD',
		disclaimer:
			'Estimated cost only. Does not include charges for other AWS services.',
	});
	expect(formatCostsInfo(1.234, 'CNY')).toEqual({
		accruedSoFar: 1.234,
		displayCost: '¥1.234',
		currency: 'CNY',
		disclaimer:
			'Estimated cost only. Does not include charges for other AWS services.',
	});
	expect(formatCostsInfo(0, 'CNY').displayCost).toBe('<¥0.001');
});
