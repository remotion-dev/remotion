export const isInsideLambda = () =>
	Boolean(typeof process !== 'undefined' && process?.env?.REMOTION_LAMBDA);
