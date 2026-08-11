export const getMaxLambdaMemory = (): number | null => {
	if (process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE) {
		return (
			parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE, 10) * 1024 * 1024
		);
	}

	return null;
};
