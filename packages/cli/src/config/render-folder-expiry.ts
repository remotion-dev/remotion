// Needs to be in sync with packages/lambda/src/functions/helpers/lifecycle.ts
type Value = '1-day' | '3-days' | '7-days' | '30-days';

let deleteAfter: Value | null = null;

export const getDeleteAfter = () => {
	return deleteAfter;
};

export const setDeleteAfter = (day: Value | null) => {
	deleteAfter = day;
};
