export const validateCustomRoleArn = (customRoleArn: unknown) => {
	if (
		typeof customRoleArn !== 'undefined' &&
		typeof customRoleArn !== 'string'
	) {
		throw new TypeError(
			'A custom role ARN must either be "undefined" or a string, but instead got: ' +
				JSON.stringify(customRoleArn),
		);
	}
};
