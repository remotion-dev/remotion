export const getCurrentFunctionName = () => {
	if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
		throw new Error('Expected AWS_LAMBDA_FUNCTION_NAME to be set');
	}

	return process.env.AWS_LAMBDA_FUNCTION_NAME;
};
