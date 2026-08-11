/* eslint-disable no-promise-executor-return */
export const delay = (n: number) =>
	new Promise((resolve) => setTimeout(resolve, n));
