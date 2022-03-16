export const isInsideLambda = () =>
	Boolean(typeof process !== 'undefined' && process?.env?.LAMBDA_TASK_ROOT);
