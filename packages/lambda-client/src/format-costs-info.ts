import type {CostsInfo} from './types';

export type BillingCurrency = 'USD' | 'CNY';

const display = (accrued: number, currency: BillingCurrency) => {
	if (accrued < 0.001) {
		return `<${currency === 'CNY' ? '¥' : '$'}0.001`;
	}

	return new Intl.NumberFormat('en-US', {
		currency,
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		minimumFractionDigits: 3,
	}).format(accrued);
};

export const formatCostsInfo = (
	accrued: number,
	currency: BillingCurrency = 'USD',
): CostsInfo => {
	return {
		accruedSoFar: accrued,
		displayCost: display(accrued, currency),
		currency,
		disclaimer:
			'Estimated cost only. Does not include charges for other AWS services.',
	};
};
