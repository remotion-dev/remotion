export const encodeAwsUrlParams = (input: string) => {
	return encodeURIComponent(input).replace(/%/g, '$25');
};
