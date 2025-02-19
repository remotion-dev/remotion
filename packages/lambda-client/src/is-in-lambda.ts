export const isInsideLambda = () =>
	Boolean(
		typeof process !== 'undefined' &&
			process?.env?.__RESERVED_IS_INSIDE_REMOTION_LAMBDA,
	);
