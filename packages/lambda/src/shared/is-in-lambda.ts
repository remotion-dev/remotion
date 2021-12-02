export const isInLambda =
	Boolean(process.env.LAMBDA_TASK_ROOT) ||
	process.env.JEST_WORKER_ID !== undefined;
