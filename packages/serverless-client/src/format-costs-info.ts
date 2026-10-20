import type {CostsInfo} from './types';

// An ISO 4217 currency code, e.g. 'USD' or 'CNY'.
export type BillingCurrency = string;

export const COSTS_DISCLAIMER =
	'Estimated cost for function invocations only. Does not include cost for storage and data transfer.';

export const formatCurrency = ({
	amount,
	currency,
	minimumFractionDigits,
}: {
	amount: number;
	currency: BillingCurrency;
	minimumFractionDigits: number;
}) => {
	return new Intl.NumberFormat('en-US', {
		currency,
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		minimumFractionDigits,
		maximumFractionDigits: 3,
	}).format(amount);
};

export const formatCostsInfo = (
	accrued: number,
	currency: BillingCurrency = 'USD',
): CostsInfo => {
	return {
		accruedSoFar: accrued,
		displayCost:
			accrued < 0.001
				? `<${formatCurrency({amount: 0.001, currency, minimumFractionDigits: 3})}`
				: formatCurrency({amount: accrued, currency, minimumFractionDigits: 3}),
		currency,
		disclaimer: COSTS_DISCLAIMER,
	};
};
