import type {CostsInfo} from './types';

const display = (accrued: number) => {
	if (accrued < 0.001) {
		return '<$0.001';
	}

	return new Intl.NumberFormat('en-US', {
		currency: 'USD',
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		minimumFractionDigits: 3,
	}).format(accrued);
};

export const formatCostsInfo = (accrued: number): CostsInfo => {
	return {
		accruedSoFar: accrued,
		displayCost: display(accrued),
		currency: 'USD',
		disclaimer:
			'Estimated cost only. Does not include charges for other AWS services.',
	};
};
