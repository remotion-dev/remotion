export function streamifyResponse(handler: Function): Function {
	// Check if we are inside Lambda
	if (
		process.env.AWS_LAMBDA_FUNCTION_VERSION &&
		process.env.AWS_LAMBDA_FUNCTION_NAME &&
		// @ts-expect-error
		typeof awslambda !== 'undefined'
	) {
		// @ts-expect-error
		return awslambda.streamifyResponse(handler);
	}

	return () => {
		throw new Error('Lambda not detected');
	};
}
